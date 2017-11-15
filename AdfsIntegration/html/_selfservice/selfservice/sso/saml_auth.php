<?php
error_reporting(E_ALL);

$location = $_GET['returnto'];
$domain = parse_url($location, PHP_URL_HOST);
if($domain === 'localhost' || $domain === '127.0.0.1') {
	include_once('error/index.html.php');
	die();
}

session_start();
require_once(dirname(__FILE__) . '/../../../simplesamlphp/lib/_autoload.php');

$strInstanceID = $_GET['wssinstance'];

$as = new SimpleSAML_Auth_Simple('supportworks');
$as->requireAuth();
$attributes = $as->getAttributes();
$session = SimpleSAML_Session::getSessionFromRequest();
$session->cleanup();
include_once("stdinclude.php");
include_once("itsm_default/xmlmc/xmlmc.php");
include_once("itsm_default/xmlmc/helpers/resultparser.php");

$uid = $attributes['uid'][0];
$upn = $attributes['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn'][0];
$xmlmc = new XmlMethodCall();
$xmlmc->SetParam("selfServiceInstance", $strInstanceID);
$xmlmc->SetParam("customerId", $uid);
$xmlmc->SetParam("password ", base64_encode($upn));
if (!$xmlmc->Invoke("session", "selfServiceLogon")) {
    //Session creation failed - pass back an error
    $cred = array('error' => 'API Call Failed!');
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
error_log($_SERVER['HTTP_REFERER']);
$cred = base64_encode(json_encode($cred));


setcookie('auth', $cred, false, "/", (($domain === 'localhost') ? false : $domain));

header('Location: ' . $location, true, 303);
die();
