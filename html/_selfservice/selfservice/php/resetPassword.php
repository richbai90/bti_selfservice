<?php
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);


$selfserviceId = $request->selfserviceId;
$userId = $request->userId;
$tokenId = $request->tokenId;
$password = $request->password;

header('Content-Type: text/plain; charset=utf-8');
header('Content-Transfer-Encoding: base64');

include_once("stdinclude.php");
include_once("itsm_default/xmlmc/classCreateLocalSession.php");
include_once("itsm_default/xmlmc/xmlmc.php");

$session = new classCreateLocalSession();

if (!$session->IsValidSession()){
	// -- Unable to establish session::createLocalSession, abort
	echo "[001] An unexpected problem occured. Please contact your system administrator";
	break;
}
else {
	 $xmlmc = new XmlMethodCall();
	 $xmlmc->SetParam("selfserviceId", $selfserviceId);
	 $xmlmc->SetParam("customerId", $userId);
	 $xmlmc->SetParam("token", $tokenId);
	 $xmlmc->SetParam("password ", $password);
	 

	 if(!$xmlmc->Invoke("selfservice","verifyPasswordResetToken"))
		{
			echo "invalid";
		}
	 else
		 {
			echo "valid";
		 }
}
