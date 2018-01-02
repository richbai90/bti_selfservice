<?php
error_reporting(E_ALL);
require_once('http_build_url.php');
require_once('saml_opts.php');
$location = $_GET['returnto'];
$url = parse_url($location);
$domain = $url['host'];
if ($domain === 'localhost' || $domain === '127.0.0.1') {
    include_once('error/index.html.php');
    die();
}

session_start();
require_once(dirname(__FILE__) . '/../../../simplesamlphp/lib/_autoload.php');
$as = new SimpleSAML_Auth_Simple('supportworks');

if (isset($_GET['logoff'])) {
	if(!defined('SSO_LOGOFF') || SSO_LOGOFF === false) {
		empty($url['query']) ? $url['query'] = 'LogoutState=1' : $url['query'] .= '&LogoutState=1';
		header('Location: ' . http_build_url($url, null, HTTP_URL_JOIN_QUERY), true, 303);
		die();
	}
    $as->logout(array(
        'ReturnTo' => $location,
        'ReturnStateParam' => 'LogoutState',
        'ReturnStateStage' => 'MyLogoutState',
    ));
} else {
    $strInstanceID = $_GET['wssinstance'];
    $as->requireAuth();
    $attributes = $as->getAttributes();
    $session = SimpleSAML_Session::getSessionFromRequest();
    $session->cleanup();
    include_once("stdinclude.php");
    include_once("itsm_default/xmlmc/xmlmc.php");
    include_once("itsm_default/xmlmc/helpers/resultparser.php");

    //-- turn into xmldom
	$strXmFilePath = 	sw_getcfgstring("InstallPath")."\conf\swserverservice.xml";
	$xmlfp = file_get_contents($strXmFilePath);
    $_trustedkeyfromconfig = "";
    $xmlDoc = domxml_open_mem(utf8_encode($xmlfp));
    $root = $xmlDoc->document_element();
    $arrItems = $root->get_elements_by_tagname("secretKey");
    $uid = $attributes['uid'][0];
    $upn = $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0];

	if($uid === 'Administrator') {
		$uid = 'alanc';
	}
	
    if($arrItems[0])$_trustedkeyfromconfig = $arrItems[0]->get_attribute("value");

    if($_trustedkeyfromconfig=="")
    {
        $password = strtolower($upn);
    }
    else
    {
        //--
        //-- call xmlmc to login
        $xmlmc = new XmlMethodCall();
        $xmlmc->SetParam("userId", 'admin');
        $xmlmc->SetParam("secretKey ", $_trustedkeyfromconfig);

        $loginResult   = $xmlmc->Invoke('session', 'analystLogonTrust');
        if(!$loginResult)
        {
			error_log($xmlmc->_lasterror);
            $password = strtolower($upn);
        }
        else
        {
            $xmlmc->reset();
            $xmlmc->SetParam("database", 'swdata');
            $xmlmc->SetParam("query", "select password from userdb where keysearch = '$uid'");
            if($xmlmc->Invoke('data', 'sqlQuery')) {
                $xmlmc->reset();
                $arrData = $xmlmc->xmlDom->get_elements_by_tagname("row");
                $row = $arrData[0];
                $password = _getxml_childnode_content($row,'password');
                $xmlmc->Invoke('session', 'analystLogoff');
            } else {
                $password = strtolower($upn);
            }
        }
    }



    $xmlmc = new XmlMethodCall();
    $xmlmc->SetParam("selfServiceInstance", $strInstanceID);
    $xmlmc->SetParam("customerId", $uid);
    $xmlmc->SetParam("password ", base64_encode($password));
    if (!$xmlmc->Invoke("session", "selfServiceLogon")) {
        //Session creation failed - pass back an error
        $cred = array('error' => 'API Call Failed!', 'xmlmc_error' => $xmlmc->_lasterror);
    } else {
        //Session creation success - build an array containing session information
        //so that calling AngularJS app can bind to SW session
        $arrSession = $xmlmc->xmlDom->get_elements_by_tagname("params");
        $xmlMD = $arrSession[0];
        $strSessionID = _getxml_childnode_content($xmlMD, "sessionId");
        $intWebFlags = _getxml_childnode_content($xmlMD, "webFlags");
        $strCallClass = _getxml_childnode_content($xmlMD, "callClass");
        $strGroup = _getxml_childnode_content($xmlMD, "assignGroup");
        $strAnalyst = _getxml_childnode_content($xmlMD, "assignAnalyst");
        $cred = array('success' => 'Authentication success!');
        $cred['custid'] = $uid;
        $cred['sessionId'] = $strSessionID;
        $cred['webFlags'] = $intWebFlags;
        $cred['callClass'] = $strCallClass;
        $cred['assignGroup'] = $strGroup;
        $cred['assignAnalyst'] = $strAnalyst;
    }
    empty($url['query']) ? $url['query'] = 'from_saml=1' : $url['query'] .= '&from_saml=1';
    $cred = base64_encode(json_encode($cred));
    setcookie('saml_auth', $cred, false, $url['path'], $url['host'], $url['scheme'] == 'https');
    header('Location: ' . http_build_url($url, null, HTTP_URL_JOIN_QUERY), true, 303);
    die();
}

