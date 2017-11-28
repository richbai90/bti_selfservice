<?php

	//</RF-Fix-20171103-(HTL:F0092276) - Webclient - SSPI - Login failure
	include "php5Requirements.php";
	
	//-- 01.08.2011 - connect analyst trusted session


	//-- xmlmc api functions
	//--
	function fwrite_stream($fp, $string)
	{
		for($written = 0; $written < strlen($string); $written += $fwrite)
		{
			$fwrite = fwrite($fp, substr($string, $written));
			if(!$fwrite)
			{
				return $fwrite;
			}
		}
		return $written;
	}

	function xmlmc($host, $port, $espToken, $xmlmc)
	{

		$errNo  = NULL;
		$errStr = NULL;
		if(($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE)
		{
			return FALSE;
		}    

		$httpPort = 

		$request = array(
					'POST /xmlmc HTTP/1.1',
					'Host: '.$host,
					'User-Agent: Hornbill PHP',
					'Connection: close',
					'Cache-Control: no-cache',
					'Accept: text/xmlmc',
					'Accept-Charset: utf-8',
					'Accept-Language: en-GB',
					'Cookie: ESPSessionState='.$espToken,
					'Content-Type: text/xmlmc; charset=utf-8',
					'Content-Length: '.strlen($xmlmc),
				   );

		$request = implode("\r\n", $request)
				 . "\r\n\r\n"
				 . $xmlmc;
				 
		fwrite_stream($fp, $request);
		$resCode   = NULL;
		$headers   = NULL;
		$content   = NULL;
		$newToken  = $espToken;
		$inContent = FALSE;
		while(!feof($fp))
		{
			if($inContent)
			{
				$content .= fread($fp, 8192);
			}
			else
			{
				$headers .= fread($fp, 8192);
				if($resCode === NULL && strlen($headers) >= 13)
				{
					if(!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13)))
					{
						fclose($fp);
						// Invalid http response
						return FALSE;
					}
					$resCode = (integer) substr($headers, 9, 3);
				}
				if(($eoh = strpos($headers, "\r\n\r\n")) !== FALSE)
				{
					$content = (string) substr($headers, $eoh + 4);
					$headers = substr($headers, 0, $eoh);
					if(preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts))
					{
						$newToken = $parts[1];
					}
					$headers   = explode("\r\n", $headers);
					$inContent = TRUE;
					array_shift($headers);
				}
			}
		}
		fclose($fp);
		$o          = new StdClass();
		#$o->request = $request;
		$o->token   = $newToken;
		$o->status  = $resCode;
		$o->headers = $headers;
		$o->content = $content;
		$o->xmldom = domxml_open_mem($content);
		return $o;
	}

	

	session_start();
    require_once(dirname(__FILE__) . '/../../simplesamlphp/lib/_autoload.php');

    $as = new SimpleSAML_Auth_Simple('supportworks');
    $as->requireAuth();
    $attributes = $as->getAttributes();
    $session = SimpleSAML_Session::getSessionFromRequest();
    $session->cleanup();
	
	//-- do pass thru logon - check if username is available
	if(isset($attributes['uid'][0]))
	{
		
		//-- for server info and UPN info (if set)
		include("../php/_wcconfig.php");

		$cred = $attributes['uid'];
		if (count($cred) == 1) 
		{
			//-- no domain info
			array_unshift($cred, "(no domain info - perhaps SSPIOmitDomain is On)");
		}
		list($domain, $user) = $cred;


		//-- Use UPN login i.e. username@domain.topleveldomain.com
		if((defined("_WC_UPN_SUPPORT")) && (_WC_UPN_SUPPORT))
		{
				if(defined("_WC_USE_REMOTE_DOMAIN") && (_WC_USE_REMOTE_DOMAIN))
				{
					 $loginid   =  $user.'@'.$domain;
				}
				else
				{
					 $loginid = $user.'@';
				}

				//-- is top level defined
				if((defined("_WC_TOPLEVEL_DOMAIN")) && (_WC_TOPLEVEL_DOMAIN))
				{
						 $loginid   .=   _WC_TOPLEVEL_DOMAIN;                
				}

		}
		else
		{
				$loginid   =  $user;
		}


		//-- open server config xml file and get trusted key
		//-- 
		$strXmFilePath = 	sw_getcfgstring("InstallPath")."\conf\swserverservice.xml";
		$xmlfp = @file_get_contents($strXmFilePath);
		if($xmlfp==false)
		{
			$trustedlogonmessage = "<font color='red'>The swServerService configuration file could not be loaded. Please contact your Administrator.</font>";
		}
		else
		{
			//-- turn into xmldom
			$_trustedkeyfromconfig = "";
			$xmlDoc = domxml_open_mem(utf8_encode($xmlfp));
			$root = $xmlDoc->document_element();
			$arrItems = $root->get_elements_by_tagname("secretKey");
			if($arrItems[0])$_trustedkeyfromconfig = $arrItems[0]->get_attribute("value");

			if($_trustedkeyfromconfig=="")
			{
				$trustedlogonmessage = "<font color='red'>The trusted key could not be found in the SwServerService configuration file. Please contact your Administrator.</font>";			
			}
			else
			{
				//--
				//-- call xmlmc to login
				$xLogin        = '<?xml version="1.0" encoding="utf-8"?><methodCall service="session" method="analystLogonTrust"><params><userId>'.utf8_encode($loginid).'</userId><secretKey>'.$_trustedkeyfromconfig.'</secretKey></params></methodCall>';
				$loginResult   = xmlmc(_SERVER_NAME, 5015, NULL, $xLogin);
				if($loginResult==FALSE)
				{
					$trustedlogonmessage = "<font color='red'>Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.</font>";
				}
				else if($loginResult->status!=200)
				{
					//-- some http error has occured
					$trustedlogonmessage = "<font color='red'>A http request error has occured. " . $loginResult->status.". Please contact your Administrator</font>";
				}
				else
				{
					//-- get result - convert string to xmldom
					$root = $loginResult->xmldom->document_element();
					$echoResult = $root->get_attribute('status'); 
					if(strToLower($echoResult) == "ok")
					{	
						//-- get analysts session id and store esp state
						$tag = $root->get_elements_by_tagname("SessionID");
						@session_destroy(); //-- kill any pre-existing session
						session_start();
						session_regenerate_id();
						setcookie(session_name(), session_id(), 0, '/sw/webclient',"; HttpOnly",($_SERVER["HTTPS"]=="on"));
					
						//-- 14.05.2012 - 88292
						//-- set session token that client must submit as part of any request to prevent CSRF
						$sessiontoken =  sha1(uniqid(mt_rand(), true));
						$_SESSION['clienttoken']=$sessiontoken;
						//-- eof 88292

						//-- 18.05.2012 - 88291 - to help prevent session fixation - store some info about where login came from
						$_SESSION['PREV_USERAGENT'] = $_SERVER['HTTP_USER_AGENT'];
						$_SESSION['PREV_REMOTEADDR'] = $_SERVER['REMOTE_ADDR'];
						$_SESSION['SERVER_GENERATEDSID'] = true;


						$_SESSION['swstate'] = $loginResult->token;
						$_SESSION['swsession'] = $tag[0]->get_content();


						//-- redirect to portal.php - include passthru callref if available
						$strCallrefPassthru  = "";
						if($_REQUEST['callref']!="") $strCallrefPassthru = "opencallref=".$_REQUEST['callref'];

						header('Location: ../portal.php'.$strCallrefPassthru );
						exit;
					}
					else
					{
						$tag= $root->get_elements_by_tagname("error");
						$trustedlogonmessage = "<font color='red'>The webclient trusted logon failed with [".$tag[0]->get_content()."]. Please contact your Administrator.</font>";
					}
				}
			}
		}
	}
	else
	{
		$trustedlogonmessage = "<font color='red'>Trusted authentication has been enabled but the REMOTE_USER was not found. Please contact your Administrator.</font>";
	}
	include("splash.php");
	exit;
?>
