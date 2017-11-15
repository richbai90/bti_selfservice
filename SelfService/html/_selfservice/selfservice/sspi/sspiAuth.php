<?php
  session_start();
  //Take instance ID from params;
  $strInstanceID = $_GET['wssinstance'];
  //Include config file
  include("sspiAuth.config.php");

  //Do the NTLM authentication to get logged in username and domain
  if(isset($_SERVER['REMOTE_USER'])) {
    $cred = explode("\\",$_SERVER['REMOTE_USER']);
    if (count($cred) == 1) array_merge(array('error' => 'No domain info set - perhaps SSPIOmitDomain is On.'), $cred);
  } else {
    $cred = array ('error'=>'Remote User not set on host. SSPI incorrectly configured, or authentication failed.');
  }

  //Add prefix from config to domain name
  $cred[0] = $authPrefix . $cred[0];

  //Set header as JSON for passing params back to Angular app
  header('Content-type: application/json');

  if(!$cred[error]){
    //If NTLM authentication was successful, create the Supportworks WSS session
    include_once("stdinclude.php");
    include_once("itsm_default/xmlmc/xmlmc.php");
    include_once("itsm_default/xmlmc/helpers/resultparser.php");
    $strUsername = $cred[1];
    $xmlmc = new XmlMethodCall();
    $xmlmc->SetParam("selfServiceInstance", $strInstanceID);
    $xmlmc->SetParam("customerId", $cred[1]);
    $xmlmc->SetParam("password ", base64_encode($cred[0]));
    if(!$xmlmc->Invoke("session","selfServiceLogon")) {
      //Session creation failed - pass back an error
      $cred = array ('error'=>'API Call Failed!');
    } else {
      //Session creation success - build an array containing session information
      //so that calling AngularJS app can bind to SW session
      $arrSession = $xmlmc->xmlDom->get_elements_by_tagname("params");
      $xmlMD = $arrSession[0];
      $strSessionID =_getxml_childnode_content($xmlMD,"sessionId");
      $intWebFlags =_getxml_childnode_content($xmlMD,"webFlags");
      $strCallClass =_getxml_childnode_content($xmlMD,"callClass");
      $strGroup =_getxml_childnode_content($xmlMD,"assignGroup");
      $strAnalyst =_getxml_childnode_content($xmlMD,"assignAnalyst");
      $cred = array ('success'=>'Authentication success!');
      $cred['custid'] = $strUsername;
      $cred['sessionId'] = $strSessionID;
      $cred['webFlags'] = $intWebFlags;
      $cred['callClass'] = $strCallClass;
      $cred['assignGroup'] = $strGroup;
      $cred['assignAnalyst'] = $strAnalyst;
    }
  }

  //Convert array to JSON, return to Angular APP
  echo json_encode($cred);
