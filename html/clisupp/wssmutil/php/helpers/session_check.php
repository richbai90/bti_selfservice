<?php
session_start();
//	error_reporting(E_ALL);
$_SESSION['portalmode'] = "FATCLIENT";

	//-- Include our standard include functions page
	@include_once("global.settings.php");
//	@include_once("itsm_default/xmlmc/classActivePageSession.php");
//	@include_once("itsm_default/xmlmc/common.php");

include_once("itsm_default/xmlmc/classActivePageSession.php");
include_once("itsm_default/xmlmc/common.php");

//### set this to false if you want to migrate between all applications - set to true if you want to keep applications separated according to the Global Settings Rules.
// please note that if the appcode does NOT exist in the wizard table, this should be set to false.
$_SESSION['bAppcodeStrictlySeparated'] = false;

//--error_reporting(E_ERROR | E_PARSE );

//-- Construct a new active page session
error_log(json_encode($_SESSION, JSON_PRETTY_PRINT));
$session = new classActivePageSession(gv('sessid'));

//-- Initialise the session
if (!$session->IsValidSession()) {
    ?>
    <html>
    <head>
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="-1">
        <title>Supportworks Session Authentication Failure</title>
        <link rel="stylesheet" href="sheets/maincss.css" type="text/css">
    </head>
    <body>
    <br><br>
    <center>
						<span class="error">
                            <?= gv('sessid') . "<br />" ?>
                            There has been a session authentication error<br>
							Please contact your system administrator.
						</span>
    </center>
    </body>
    </html>
    <?php
    exit;
}

//-- user is not a system administrator
if ($GLOBALS['privlevel'] < 3) {
    ?>
    <html>
    <head>
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Expires" content="-1">
        <title>Supportworks Session Authentication Failure</title>
        <link rel="stylesheet" href="sheets/maincss.css" type="text/css">
    </head>
    <body>
    <br><br>
    <center>
							<span class="error">
                                <?= "privlevel : " . $GLOBALS['privlevel'] . "<br />" ?>
                                There has been a session authentication error<br>
								Please contact your system administrator.
							</span>
    </center>
    </body>
    </html>
    <?php
    exit;
}

$boolNotInUse = true;
$con = new CSwDbConnection;
if (!$con->Connect(swdsn(), swuid(), swpwd())) {
    echo "Failed to connect to database, please check ODBC connection";
    exit;
}

$_SESSION['bAppcodeSeparatedSystem'] = null;

$_SESSION['sessid'] = gv('sessid');

if (!(isset($_SESSION['strDirectory']) && isset($_SESSION['arrApplications']) && isset($_SESSION['strFilterApplications']))) {
    $_SESSION['strDirectory'] = "../wizards/";

    // adjust default for current calculation.
    if ("../wizards/" == $_SESSION['strDirectory']) {
        $_SESSION['strDirectory'] = "wizards/";
    }

    if ($_SESSION['bAppcodeSeparatedSystem'] && $_SESSION['bAppcodeStrictlySeparated']) {
        $strAppcodeFilter = getAppcodeFilter('FILTER.APPCODE.BPM');
        if ($strAppcodeFilter != "") {
            $_SESSION['arrApplications'] = explode(",", strtoupper($strAppcodeFilter));
        } else {
            $_SESSION['arrApplications'] = array();
            $_SESSION['arrApplications'][] = "'" . strtoupper(gv('dataset')) . "'"; // to match data format from db above.
        }
    } else {
        $_SESSION['arrApplications'] = array();
        if ($_SESSION['bAppcodeStrictlySeparated']) {
            $_SESSION['arrApplications'][] = "'" . strtoupper(gv('dataset')) . "'"; // to match data format from db above.
        } else {
            if (!is_dir($_SESSION['strDirectory'])) {
                mkdir($_SESSION['strDirectory']);
            }

            $mydir = opendir($_SESSION['strDirectory']);
            if (!is_dir($_SESSION['strDirectory'] . gv('dataset'))) {
                mkdir($_SESSION['strDirectory'] . gv('dataset'));
            }
            while (($file = readdir($mydir)) !== false) {
                if (!('.' == $file || '..' == $file)) {
                    if (is_dir($_SESSION['strDirectory'] . $file)) {
                        $_SESSION['arrApplications'][] = "'" . strtoupper($file) . "'"; // to match data format from db above.
                    }
                }
            }
            closedir($mydir);
        }
    }
    $_SESSION['strFilterApplications'] = " WHERE APPCODE IN (" . implode(",", $_SESSION['arrApplications']) . ")";

    //-re-adjust default back
    if ("wizards/" == $_SESSION['strDirectory']) {
        $_SESSION['strDirectory'] = "../wizards/";
    }

}
?>
