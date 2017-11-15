<?php

//error_reporting(E_ALL);
//error_reporting(E_ERROR | E_WARNING | E_PARSE);

//	Constants for identifying the control types in data dictionary. The values are from SwCoreLib, file SwColumnDesc.h
//	They are used by the extension DLL, returned by function [swdti_getfieldtype].
//	Example: 
//		swdti_getfieldtype("opencall.logdatex") == SWCD_CONTROL_DATETIMECTRL

@define("SWCD_CONTROL_EDIT", 0);        // Standard Edit property
@define("SWCD_CONTROL_COMBO", 1);    // Standard Combo list
@define("SWCD_CONTROL_FLAGCOMBO", 2);        // Flags Combo
@define("SWCD_CONTROL_DISTCOMBO", 3);        // Distinct SQL combo
@define("SWCD_CONTROL_PASSWORDEDIT", 4);        // Single line password edit field
@define("SWCD_CONTROL_DATETIMECTRL", 5);    // Date/Time Picker
@define("SWCD_CONTROL_YESNO", 6);    // True/False or Yes/No picker
@define("SWCD_CONTROL_ICON", 7);    // Image control for displaying icons
@define("SWCD_CONTROL_DISTCOMBOWITHICON", 8);        // Distinct SQL combo with Icon image
@define("SWCD_CONTROL_DISTCOMBODUALVALUE", 9);        // Distinct SQL combo that holds two values per item (e.g. CODE/DESCRIPTION)
@define("SWCD_CONTROL_FORMFLAGS", 10);    // Same as flags combo but flags are displayed on the form
@define("SWCD_CONTROL_SWEMAILADDRESS", 11);    // Display/Pick an e-mail address from the GAL
@define("SWCD_CONTROL_INCLUDEEXCLUDELIST", 12);    // Displays a list of items to include/exclude. result list is stored as a comma separated list
@define("SWCD_CONTROL_PICKLISTEDITOR", 13);    // Displays an editable list of items/value to display in a pick list combo
@define("SWCD_CONTROL_FLAGLISTEDITOR", 14);    // Displays an editable list of items/value to display in a flag list combo
@define("SWCD_CONTROL_SECONDTIMEPERIOD", 15);    // Displays a time period in h:mm:ss
@define("SWCD_CONTROL_MINUTETIMEPERIOD", 16);    // Displays a time period in h:mm
@define("SWCD_CONTROL_COMBO2", 17);    // Displays an editable list of text values to display in a pick list combo
@define("SWCD_CONTROL_LOCDISTCOMBO", 18);    // Distinct pick list for local ODBC databases

//	Constants for identifying the column data types in data dictionary. The values are from SwCoreLib, file SwVariable.h
//	Not all of them are listed here. They are used by the extension DLL, returned by function [swdti_getdatatype].
//	Example: 
//		swdti_getdatatype("opencall.logdatex") == VT_V_DWORD
@define("VT_V_STRING", 0x0008);
@define("VT_V_DWORD", 0x0012);
@define("VT_V_DOUBLE", 0x0016);

//	Constants for Date/Time modes - returned by PHP extension function [swdti_getdtmode]
@define("SW_DTMODE_DATETIME", 0);
@define("SW_DTMODE_DATEONLY", 1);
@define("SW_DTMODE_TIMEONLY", 2);
@define("SW_DTMODE_CUSTOM", 3);

// -- Constants for date variables used in _sw_time() to determine epoch value
define("startoftoday", "startoftoday");
define("endoftoday", "endoftoday");
define("startofmonth", "startofmonth");
define("endofmonth", "endofmonth");
define("startofquater", "startofquater");
define("endofquater", "endofquater");
define("startofquarter", "startofquarter");
define("endofquarter", "endofquarter");
define("startofyear", "startofyear");
define("endofyear", "endofyear");
define("startoflastmonth", "startoflastmonth");
define("endoflastmonth", "endoflastmonth");
define("startoflastquater", "startoflastquater");
define("endoflastquater", "endoflastquater");
define("startoflastquarter", "startoflastquarter");
define("endoflastquarter", "endoflastquarter");
define("startoflastyear", "startoflastyear");
define("endoflastyear", "endoflastyear");
define("startofyesterday", "startofyesterday");
define("endofyesterday", "endofyesterday");
define("startofweek", "startofweek");
define("endofweek", "endofweek");
define("startoflastweek", "startoflastweek");
define("endoflastweek", "endoflastweek");

//-- get config setting value
$_swconfigxml = null;
function sw_getcfgstring($strPath)
{
    global $_swconfigxml;

    //-- not @defined yet so load conf file (note we get content then encode to utf8 in order fordom xml to work)
    if ($_swconfigxml == null) {
        $dirName = realpath(dirname(__FILE__));
        $myXMLString = file_get_contents($dirName . '\..\..\conf\SwServerService.xml');
        $myXMLString = utf8_encode($myXMLString);
        $_swconfigxml = new DOMDocument;
        $_swconfigxml->loadXML($myXMLString);
    }

    $arrParts = explode("\\", $strPath);
    $node = null;
    $currNode = $_swconfigxml;
    for ($x = 0; $x < count($arrParts); $x++) {
        $tagName = $arrParts[$x];
        $node = $currNode->getElementsByTagName($tagName)->item(0);
        $currNode = $node;
    }

    if ($node) {
        return $node->getAttribute("value");
    } else return "";
}

function sw_getcfgdword($strPath)
{
    $res = sw_getcfgstring($strPath);
    if ($res == "") $res = 0;
    return $res;
}

function sw_getcfgstringxpath($query)
{
    global $_swconfigxml;

    //-- not @defined yet so load conf file (note we get content then encode to utf8 in order fordom xml to work)
    if ($_swconfigxml == null) {
        $myXMLString = file_get_contents('../../conf/SwServerService.xml');
        $myXMLString = utf8_encode($myXMLString);
        $_swconfigxml = new DOMDocument;
        $_swconfigxml->loadXML($myXMLString);
    }

    $xpath = new DOMXPath($_swconfigxml);
    return $xpath->query($query);
}

function sw_getregstring()
{
    //-- no longer supported
    return "";
}

function sw_getregdword()
{
    //-- no longer supported
    return 0;
}


//-- return the cache database userid
function swgetSwRego($path)
{
    //-- not supported - will get settings from an xml file
}

function sw_getappversion($applicationName)
{
    //-- stored in registry "HKLM/Software/Hornbill/<$applicationName>
    return "";
}

$sessid = null;
function swCreateSessionFromID($sessionid)
{

    global $sessid;
    $sessid = $sessionid;
    $xmlmc = new swphpXmlMethodCall();
    $xmlmc->SetParam("sessionId", $sessionid);
    if ($xmlmc->invoke("session", "bindSession", true)) {
        $response = json_decode(utf8_encode($xmlmc->xmlresult));
        if ($response->{"@status"} == false) {
            return false;
        } else return true;
    } else return false;
}


function swCreateTemporarySession()
{
    $xmlmc = new swphpXmlMethodCall();
    if ($xmlmc->Invoke("session", "createLocalSession")) return $xmlmc->currentState;
    else return false;
}

function swCloseTemporarySession()
{
    $xmlmc = new swphpXmlMethodCall();
    return $xmlmc->Invoke("session", "closeLocalSession");
}

function _awdsn()
{
    return "Assetworks Data";
}

function _awuid()
{
    return "root";
}

function _awpwd()
{
    return "";
}

function odbc_information()
{
    //Getting the path of the supportworks server
    $swinstallpath = sw_getcfgstring("InstallPath");

    //Getting the path of the odbc's details executable
    $odbc_details = $swinstallpath . "\bin\SwCredSupp.exe";

    //Getting the details from the ODBC connection
    exec($odbc_details, $out);

    //Extractig ODBC details
    $decoded = base64_decode($out[0]);
    $splited = explode("\t", $decoded);

    return $splited;
}

function swdsn()
{
    $odbc_details = odbc_information();

    //Returning APP Id
    return $odbc_details[2];
}

function swuid()
{
    $odbc_details = odbc_information();

    //Returning APP Id
    return $odbc_details[3];
}

function swpwd()
{
    $odbc_details = odbc_information();

    //Returning APP Id
    return $odbc_details[4];
}

function swcuid()
{
    $odbc_details = odbc_information();

    //Returning APP Id
    return $odbc_details[0];
}

function swcpwd()
{
    $odbc_details = odbc_information();

    //Returning APP Id
    return $odbc_details[1];
}


//-- swdti methods
$_swloadedDDFName = "";
$_swloadedDDF = null;
$_swloadedGlobalParams = null;
function swdti_load($dataDictionary)
{
    global $_swloadedDDFName;
    global $_swloadedDDF;
    global $_swloadedGlobalParams;

    //-- not @defined yet so load conf file (note we get content then encode to utf8 in order fordom xml to work)
    if ($_swloadedDDF == null || $_swloadedDDFName != $dataDictionary) {
        $path = getcwd();
        $path = explode('\html\\', $path)[0];
        $path = $path . '\data\_dd_data\exported\\' . $dataDictionary . '\\xml\\';
        $_swloadedDDF = json_decode(utf8_encode(trim(file_get_contents($path . 'db\\swdata.json'))));
        $_swloadedGlobalParams = json_decode(utf8_encode(trim(file_get_contents($path . 'globalParams\\Global Parameters.json'))));
        $_swloadedDDFName = $dataDictionary;
    }
    return ($_swloadedDDF && $_swloadedGlobalParams) ? 1 : 0;
    //return ($_swloadedDDF) ? 1 : 0;
}


$_swdti_loadedcols = Array();
function _swdti_getcolinfo($strBinding)
{
    global $_swdti_loadedcols;
    $strBinding = strToLower($strBinding);

    if (isset($_swdti_loadedcols[$strBinding])) {
        return $_swdti_loadedcols[$strBinding];
    } else {
        global $_swloadedDDF;
        $arrInfo = explode(".", $strBinding);
        if ($_swloadedDDF) {
            $arrTables = $_swloadedDDF->espDatabaseSchema->database->tables->table;
            for ($x = 0; $x < count($arrTables); $x++) {
                //-- find our table
                if ($arrTables[$x]->{"@name"} == $arrInfo[0]) {
                    $arrCols = $arrTables[$x]->columns->column;
                    if (!is_array($arrCols)) $arrCols = Array($arrCols);
                    for ($y = 0; $y < count($arrCols); $y++) {
                        if ($arrCols[$y]->{"@name"} == $arrInfo[1]) {
                            $_swdti_loadedcols[$strBinding] = $arrCols[$y];
                            return $arrCols[$y];
                        }
                    }
                    break;
                }
            }
        } else {
            //-- load default
            swdti_load("Default");
            return _swdti_getcolinfo($strBinding);
        }
        return null;
    }
}

function swdti_getcoldispname($strBinding)
{
    $strDisplay = $strBinding;
    $col = _swdti_getcolinfo($strBinding);
    if (@$col->{"displayName"}) $strDisplay = $col->{"displayName"};
    return $strDisplay;
}

function swdti_gettbldispname($strTable)
{
    global $_swloadedDDF;

    $arrInfo = explode(".", strToLower($strTable));
    $strDisplay = $arrInfo[0];

    if ($_swloadedDDF) {
        $arrTables = $_swloadedDDF->espDatabaseSchema->database->tables->table;
        for ($x = 0; $x < count($arrTables); $x++) {
            //-- find our table
            if ($arrTables[$x]->{"@name"} == $arrInfo[0]) {
                if (@$arrTables[$x]->{"displayName"}) $strDisplay = $arrTables[$x]->{"displayName"};

                break;
            }
        }
    } else {
        //-- load default
        swdti_load("Default");
        return swdti_gettbldispname($strTable);
    }

    return $strDisplay;
}

function swdti_getfieldtype($strBinding)
{
    $intType = SWCD_CONTROL_EDIT;

    $col = _swdti_getcolinfo($strBinding);
    if ($col && $col->control->{"@type"}) {
        switch (strtoLower($col->control->{"@type"})) {
            case "text edit":
                $intType = SWCD_CONTROL_EDIT;
                break;
            case "pick list (numeric mode)":
                $intType = SWCD_CONTROL_COMBO;
                break;
            case "distinct pick list":
                $intType = SWCD_CONTROL_DISTCOMBO;
                break;
            case "date/time control":
                $intType = SWCD_CONTROL_DATETIMECTRL;
                break;
            case "form flags":
                $intType = SWCD_CONTROL_FORMFLAGS;
                break;
            case "e-mail address":
                $intType = SWCD_CONTROL_SWEMAILADDRESS;
                break;
        }
    }

    return $intType;

}

function swdti_getdtmode($strBinding)
{

    $intType = SW_DTMODE_DATETIME;

    $col = _swdti_getcolinfo($strBinding);
    if ($col && $col->control->{"textInputFormat"}) {
        switch (strtoLower($col->control->{"textInputFormat"})) {
            case "date/time":
                $intType = SW_DTMODE_DATETIME;
                break;
            case "date":
                $intType = SW_DTMODE_DATEONLY;
                break;
            case "time":
                $intType = SW_DTMODE_TIMEONLY;
                break;
            default:
                $intType = SW_DTMODE_CUSTOM;
        }
    }

    return $intType;
}

function swdti_getdatatype($strBinding)
{
    global $_swloadedDDF;

    $col = _swdti_getcolinfo($strBinding);
    switch ($col->{"@sqlType"}) {
        case "INTEGER":
            return VT_V_DWORD;
        case "VARCHAR":
        case "LONGVARCHAR":
            return VT_V_STRING;
        case "DOUBLE":
            return VT_V_DOUBLE;
    }

    return -1;

}

function swdti_getdtformat($strBinding)
{
    global $_swloadedDDF;

    $strMask = "";
    $col = _swdti_getcolinfo($strBinding);
    if ($col && @$col->control->{"inputMask"}) $strMask = $col->control->{"inputMask"};

    return $strMask;
}

function swdti_timefromstring_uk($gmtFormattedDate)
{
    //-- dd/mm/yyyy hh:mm:ss
    $dateParts = explode(' ', $gmtFormattedDate);
    $dateValues = explode('/', $dateParts[0]);
    if ($dateParts[1]) $timeValues = explode(':', $dateParts[1]);
    else $timeValues = Array(0, 0, 0);

    return mktime($timeValues[1], $timeValues[0], $timeValues[2], $dateValues[1], $dateValues[0], $dateValues[2]);

}

function swdti_timefromstring_iso($isoFormattedDate)
{
    return strtotime($isoFormattedDate);
}


function swdti_offset_time($strTzName = "", $unixTimeStamp)
{
    $offset = swdti_get_crt_timezone_offset($strTzName);
    return $unixTimeStamp + $offset;

    $retValue = $unixTimeStamp;
    $mc = new swphpXmlMethodCall();
    $mc->SetParam("epochTime", $unixTimeStamp);
    if ($strTzName != "") $mc->SetParam("timeZone", $strTzName);
    if ($mc->invoke("system", "offsetEpochTime", true)) {
        $objJson = @json_decode($mc->xmlresult);
        if ($objJson && @$objJson->params) $retValue = $objJson->params->time;
    }
    return $retValue;
}

$_swdti_get_crt_timezone_offset = Array();
function swdti_get_crt_timezone_offset($strTzName)
{
    global $_swdti_get_crt_timezone_offset;
    if (isset($_swdti_get_crt_timezone_offset[$strTzName])) {
        return $_swdti_get_crt_timezone_offset[$strTzName];
    } else {
        //-- get tz offset for given tz
        $retValue = 0;
        $mc = new swphpXmlMethodCall();
        $mc->SetParam("timeZone", $strTzName);
        if ($mc->invoke("system", "getTimezoneOffset", true)) {
            $objJson = @json_decode($mc->xmlresult);
            if ($objJson && @$objJson->params) $retValue = $objJson->params->offset;
        }
        $_swdti_get_crt_timezone_offset[$strTzName] = $retValue;
        return $retValue;
    }
}

function swdti_formatvalue($strBinding, $strValue)
{
    $retValue = $strValue;
    $strBinding = strToLower($strBinding);
    if ($strBinding == "opencall.callref") {
        //-- call sql to get the h formatted callref - this is how c++ do it. (surely dont need sql to do this as its stored in ddf?)
        $retValue = swcallref_str($strValue);
    } else {
        $intType = swdti_getfieldtype($strBinding);
        if ($intType == SWCD_CONTROL_DATETIMECTRL) {
            //--
            global $session;
            global $timezone;
            global $datetimefmt;
            global $datefmt;
            global $timefmt;
            $timezone = @$session->timezone;
            $datetimefmt = @$session->datetimefmt;
            $datefmt = @$session->datefmt;
            $timefmt = @$session->timefmt;
            if ($datetimefmt == "") $datetimefmt = "yyyy-MM-dd hh:mm";
            if ($datefmt == "") $datefmt = "yyyy-MM-dd";
            if ($timefmt == "") $timefmt = "hh:mm:ss";
            return SwFormatDateTimeColumn($strBinding, $strValue, $timezone);
        } else {
            $col = _swdti_getcolinfo($strBinding);
            if ($col && $col->control && @$col->control->{"pickOptions"} && @$col->control->{"pickOptions"} != "") {
                return _swdti_getpicklistoption_display($col->control, $strValue);
            }

            $mask = swdti_getdtformat($strBinding);
            if ($mask != "") {
                //-- find any ## and replace with value
                $hashCount = substr_count($mask, '#');
                $hashReplace = "";
                $retValue = str_pad($strValue, $hashCount, "0", STR_PAD_LEFT);
                for ($x = 0; $x < $hashCount; $x++) {
                    $hashReplace .= "#";
                }
                $retValue = str_replace($hashReplace, $retValue, $mask);
            }
        }
    }
    return $retValue;
}

//-- not supported - wont fail 
function swdebug_print($strData)
{
    return $strData;
}

function swtime($szValue = "")
{
    return _sw_time($szValue);
}

function _sw_time($szValue = "")
{
    if (($szValue == NULL) || ($szValue == "") || strtoLower($szValue) == "now") {
        return time();
    } else {
        $date = new DateTime();
        switch (strtoLower($szValue)) {
            case "startofmonth":
                $date->modify("first day of this month")->setTime(0, 0, 0);
                return $date->getTimestamp();

            case "endofmonth":
                $date->modify("last day of this month")->setTime(23, 59, 59);
                return $date->getTimestamp();

            case "startofquarter":
            case "startofquater":
                return currentQuarterStartEnd()[0];
            case "endofquater":
            case "endofquarter":
                return currentQuarterStartEnd()[1];

            case "startofyear":
                $date->modify("first day of january")->setTime(0, 0, 0);
                return $date->getTimestamp();

            case "endofyear":
                $date->modify("last day of this year")->setTime(23, 59, 59);
                return $date->getTimestamp();

            case "startoftoday":
                $date->modify("today");
                return $date->getTimestamp();

            case "endoftoday":
                $date->modify("tomorrow");
                return $date->getTimestamp() - 1;


            case "startofweek":
                return strtotime("last sunday");
            case "endofweek":
                return strtotime("next sunday") - 1;

            case "startoflastmonth":
                $date->modify("first day of previous month")->setTime(0, 0, 0);
                return $date->getTimestamp();

            case "endoflastmonth":
                $date->modify("last day of previous month")->setTime(23, 59, 59);
                return $date->getTimestamp();

            case "startoflastquarter":
            case "startoflastquater":
                return lastQuarterStartEnd()[0];

            case "endoflastquater":
            case "endoflastquarter":
                return lastQuarterStartEnd()[1];

            case "startoflastyear":
                $date->modify("first day of last year january")->setTime(0, 0, 0);
                return $date->getTimestamp();

            case "endoflastyear":
                $date->modify("last day of last year")->setTime(23, 59, 59);
                return $date->getTimestamp();

            case "startofyesterday":
                $date->modify("yesterday");
                return $date->getTimestamp();

            case "endofyesterday":
                $date->modify("today");
                return $date->getTimestamp() - 1;

            case "startoflastweek":
                return strtotime("2 weeks ago sunday");
            case "endoflastweek":
                return strtotime("last sunday") - 1;

        }

        return time();
    }
}

function sw_createdir($dirPath)
{
    return mkdir($dirPath);
}

function sw_deletedir($dirPath)
{
    return rrmdir($dirPath);
}

function sw_renamedir($oldDir, $newDir)
{
    return rename($oldDir, $newDir);
}

function sw_copyfile($oldFilePath, $newFilePath)
{
    return @copy($oldFilePath, $newFilePath);
}

function sw_deletefile($filePath)
{
    return @unlink($filePath);
}

function sw_gethostname()
{
    return gethostname();
}

function sw_gethostaddr()
{
    return $_SERVER['REMOTE_ADDR'];
}

function sw_formattime($vTime)
{
    return $vTime;
}

function sw_formatsql($strSql)
{
    //-- find instances of _sw_time and replace with actual value

    $pos = strpos($strSql, "_sw_time(");
    while ($pos !== false) {

        $closepos = strpos($strSql, ")", $pos);
        if ($closepos === false) break;

        //-- get the named date period from string
        $dateWord = substr($strSql, $pos + 9, $closepos - ($pos + 9));
        $original = "_sw_time(" . $dateWord . ")";
        $epochSwap = _sw_time($dateWord);

        //-- now replace
        $strSql = str_replace($original, $epochSwap, $strSql);
        $pos = strpos($strSql, "_sw_time(", $closepos);
    }

    return $strSql;
}

function _swdti_getpicklistoption_display($pickListControl, $intValue)
{
    if (is_numeric($intValue)) {
        $arrOptions = explode("|", $pickListControl->{"pickOptions"});
        for ($x = 0; $x < count($arrOptions); $x++) {
            $option = explode("^", $arrOptions[$x]);
            if ($option[1] == $intValue) {
                return $option[0];
            }
        }
    }
    return $intValue;
}

function swstatus_str($intStatus)
{
    /*
    1	Pending
    2	Unassigned
    3	Unaccepted
    4	On Hold
    5	Off Hold
    6	Resolved
    7	Deferred
    8	Incoming
    9	Escalated(O)
    10	Escalated(G)
    11	Escalated(A)
    12	Not used
    13	Not used
    14	Not used
    15	LostCall!!!
    16	Closed
    17	Cancelled
    18	Closed(Chg)
    */

    $col = _swdti_getcolinfo("opencall.status");
    if ($col) {
        return _swdti_getpicklistoption_display($col->control, $intStatus);
    }
}

function swstatus_color($intStatus)
{
    switch ($intStatus) {
        case 1:
            return "#000000";
        case 2:
        case 3:
            return "#000080";
        case 4:
            return "#008000";
        case 5:
            return "#800000";
        case 6:
            return "#404040";
        case 7:
            return "#004000";
        case 8:
            return "#008080";
        case 9:
        case 10:
        case 11:
            return "#800000";
    }
    return "#000000";
}

//-- call task status
function swwostatus_str($intStatus)
{
    $col = _swdti_getcolinfo("calltasks.status");
    if ($col) {
        return _swdti_getpicklistoption_display($col->control, $intStatus);
    }
}

//-- call task color
function swwostatus_color($intStatus)
{
    return swstatus_color($intStatus);
}

function _sw_enumerateregkeys()
{
}


function swcallref_str($callref, $callclass = 'incident')
{

    if (isset($GLOBALS['callref_format'])) {
        $format = $GLOBALS['callref_format'];
        list($prefix, $padding) = explode('#', $format);
        $padding = $padding - strlen("$callref");
        return $prefix . str_repeat(0, $padding) . "$callref";
    }

    global $sessid;
    $retValue = "$callref";
    $xmlmc = new swphpXmlMethodCall();
    $xmlmc->SetParam("sessionId", $sessid);
    if ($xmlmc->invoke("session", "bindSession", true)) {
        $response = json_decode(utf8_encode($xmlmc->xmlresult));
        if ($response->{"@status"} !== false) {
            if ($xmlmc->invoke('session', 'getSessionInfo2', true)) {
                $response = json_decode(utf8_encode($xmlmc->xmlresult));
                if ($response->{"@status"} !== false) {
                    $dd = $response->params->currentDataDictionary;
                    if (swdti_load($dd)) {
                        global $_swloadedGlobalParams;
                        $folders = $_swloadedGlobalParams->espGlobalParameters->folder;
                        $callClassSettings = array_filter($folders, function ($f) {
                            return strtolower($f->name) === 'call class settings';
                        });

                        $callClassSettings = array_filter($callClassSettings, function ($f) use($callclass) {
                            return strtolower($f->name) === strtolower($callclass);
                        });

                        $format = (isset($callClassSettings[0]->params->param[0]->value)) ? $callClassSettings[0]->params->param[0]->value : 'F#7';
                        $GLOBALS['callref_format'] = $format;
                        list($prefix, $padding) = explode('#', $format);
                        $padding = $padding - strlen($retValue);
                        $retValue = $prefix . str_repeat(0, $padding) . $retValue;
                    }
                }
            }
        }
    }

    return $retValue;

}

//-- call sql to get the h formatted callref - this is how c++ do it. (surely dont need sql to do this as its stored in ddf?)
// $szSql = "SELECT h_formattedcallref FROM opencall WHERE callref = " . $callref;

// $mc = new swphpXmlMethodCall();
// $mc->SetParam("database","swdata");
// $mc->SetParam("query",$szSql);
// if($mc->invoke("data","sqlQuery",true))
//	{
//		$objJson = @json_decode($mc->xmlresult);
//		if($objJson &&  @$objJson->data->rowData->row) $retValue = $objJson->data->rowData->row->h_formattedcallref;
//	}


//-- supportworks helpdesk telnet operations

function swhd_closesession($server, $sid, $port = 5005)
{
    $mc = new swphpXmlMethodCall();
    $mc->SetParam("sessionId", $sid);
    if ($mc->invoke("session", "analystLogoff", true)) {
        return 1;
    }
    return 0;
}


/*  depreciated - return false in all of them */
function _swhd_open()
{
    return 0;
}

function _swhd_opensession()
{
    return 0;
}

function _swhd_openasession()
{
    return 0;
}

function _swhd_wcopen()
{
    return 0;
}

function _swhd_close()
{
    return 0;
}

function _swhd_sendcommand()
{
    return 0;
}

function _swhd_getlasterror()
{
    return 0;
}

function _swhd_getlastresponse()
{
    return 0;
}

function _swhd_getlastresponsecode()
{
    return 0;
}

function _swhd_getlastdata()
{
    return 0;
}

function _swhd_commit()
{
    return 0;
}

function _swhd_sequencecommit()
{
    return 0;
}

function _swhd_sendstrvalue()
{
    return 0;
}

function _swhd_sendtextvalue()
{
    return 0;
}

function _swhd_sendnumvalue()
{
    return 0;
}

function _swhd_sendboolvalue()
{
    return 0;
}

function _swhd_sendfilevalue()
{
    return 0;
}

function _swhd_sendrecipient()
{
    return 0;
}


function swphpGlobaliseRequestVars()
{
    foreach ($_REQUEST as $key => $val) {
        global $$key;
        $$key = $val;
    }
}

if (!function_exists('gv')) {
    //--
    //-- get a var value - check post/get and globals
    function gv($strVarName)
    {
        if (isset($_REQUEST[$strVarName])) return $_REQUEST[$strVarName];
        if (isset($GLOBALS[$strVarName])) return $GLOBALS[$strVarName];
        if (isset($_SESSION[$strVarName])) return $_SESSION[$strVarName];
        return null;
    }
}

//-- xmlmc exec
//-- xmlmc api functions
//--
if (!function_exists('swphp_fwrite_stream')) {
    function swphp_fwrite_stream($fp, $string)
    {
        for ($written = 0; $written < strlen($string); $written += $fwrite) {
            $fwrite = fwrite($fp, substr($string, $written));
            if (!$fwrite) {
                return $fwrite;
            }
        }
        return $written;
    }

    function swphp_xmlmc($host, $port, $espToken, $xmlmc, $boolAsJson = false)
    {
        $acceptType = $boolAsJson ? 'text/json' : 'text/xml';
        $request = array('User-Agent: Hornbill PHP',
            'Connection: close',
            'Cache-Control: no-cache',
            'Accept: ' . $acceptType,
            'Accept-Charset: utf-8',
            'Accept-Language: en-GB',
            'Cookie: ESPSessionState=' . $espToken,
            'Content-Type: text/xmlmc; charset=utf-8',
            'Content-Length: ' . strlen($xmlmc),
        );
        $ch = curl_init("http://$host:$port");
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $xmlmc);
        curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $request);
        curl_setopt($ch, CURLOPT_HEADER, 1);
        curl_setopt($ch, CURLOPT_ENCODING , "gzip");
        $response = curl_exec($ch);
        error_log($response);

        if (!$response) {
            $o = new StdClass();
            $o->token = $espToken;
            $o->status = false;
            $o->headers = null;
            $o->content = "";
            $o->asjson = false;
            return $o;
        }

        $resCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        list($header, $body) = explode("\r\n\r\n", $response, 2);
        if (!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($header, 0, 13))) {
            // invalid http result? Not sure how that would happen
            return false;
        }


        if (preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $header, $parts)) {
            $espToken = $parts[1];
        }



        $headers = explode("\r\n", $header);
        array_shift($headers);
        $o = new StdClass();
        $o->token = $espToken;
        $o->status = $resCode;
        $o->headers = $headers;
        $o->asjson = $boolAsJson;
        $o->content = trim(utf8_encode($body));
        $o->xmldom = null;
        if (!$boolAsJson) $o->xmldom = domxml_open_mem($o->content);

        return $o;

    }

    function old_swphp_xmlmc($host, $port, $espToken, $xmlmc, $boolAsJson = false)
    {
        $errNo = NULL;
        $errStr = NULL;
        if (($fp = @fsockopen($host, $port, $errNo, $errStr, 5)) === FALSE) {

            $o = new StdClass();
            $o->token = $espToken;
            $o->status = false;
            $o->headers = null;
            $o->content = "";
            $o->asjson = false;
            return $o;
        }

        $acceptType = ($boolAsJson) ? "text/json" : "text/xmlmc";
        $request = array(
            'POST /xmlmc HTTP/1.1',
            'Host: ' . $host,
            'User-Agent: Hornbill PHP',
            'Connection: close',
            'Cache-Control: no-cache',
            'Accept: ' . $acceptType,
            'Accept-Charset: utf-8',
            'Accept-Language: en-GB',
            'Cookie: ESPSessionState=' . $espToken,
            'Content-Type: text/xmlmc; charset=utf-8',
            'Content-Length: ' . strlen($xmlmc),
        );

        $request = implode("\r\n", $request)
            . "\r\n\r\n"
            . $xmlmc;


        swphp_fwrite_stream($fp, $request);
        $resCode = NULL;
        $headers = NULL;
        $content = NULL;
        $newToken = $espToken;
        $inContent = FALSE;
        $exitme = false;
        while (!feof($fp) && (!$exitme)) {
            if ($inContent) {
                $addcontent = fread($fp, (4096));
                $dupPos = strpos($addcontent, "</methodCallResult>");
                if ($dupPos !== false) {
                    //-- substr addcontent
                    $addcontent = substr($addcontent, 0, $dupPos) . "</methodCallResult>";
                    $exitme = true;
                }
                $content .= $addcontent;
            } else {
                $headers .= fread($fp, (4096));
                if ($resCode === NULL && strlen($headers) >= 13) {
                    if (!preg_match('~^HTTP/1\.[01] \d{3} ?~i', substr($headers, 0, 13))) {
                        fclose($fp);
                        // Invalid http response
                        return FALSE;
                    }
                    $resCode = (integer)substr($headers, 9, 3);
                }
                if (($eoh = strpos($headers, "\r\n\r\n")) !== FALSE) {
                    $content = (string)substr($headers, $eoh + 4);
                    $headers = substr($headers, 0, $eoh);
                    if (preg_match('~^Set-Cookie:\s+.*ESPSessionState=([^;]*)~mi', $headers, $parts)) {
                        $newToken = $parts[1];
                    }
                    $headers = explode("\r\n", $headers);
                    $inContent = TRUE;
                    array_shift($headers);
                }
            }
        }
        fclose($fp);

        $o = new StdClass();
        $o->token = $newToken;
        $o->status = $resCode;
        $o->headers = $headers;
        $o->asjson = $boolAsJson;
        $o->content = trim(utf8_encode($content));
        $o->xmldom = null;
        if (!$boolAsJson) $o->xmldom = domxml_open_mem($o->content);
        return $o;
    }


    class swphpDatabaseQuery
    {
        var $database = "swdata";
        var $response = null;
        var $errorMessage = "";
        var $currentRowPointer = 0;
        var $currentRow = null;

        function swphpDatabaseQuery($strSQL, $strDB = "swdata", $formatValues = true, $intRowLimit = "")
        {
            $this->database = $strDB;

            $xmlmcf = new swphpXmlMethodCall();

            $xmlmcf->SetParam("database", $this->database);
            $xmlmcf->SetParam("query", $strSQL);
            if ($formatValues) $xmlmcf->SetParam("formatValues", "true");
            $xmlmcf->SetParam("returnMeta", true);
            if ($intRowLimit != "") $xmlmcf->SetParam("maxResults", $intRowLimit);
            if ($formatValues) $xmlmcf->SetParam("returnRawValues", "true");

            if ($xmlmcf->Invoke("data", "sqlQuery", true)) {
                $this->response = json_decode(utf8_encode($xmlmcf->xmlresult));
                if ($this->response->{"@status"} == false) {
                    $this->errorMessage = $this->response->state->error;
                    error_log('are we here?');
                    return false;
                } else return true;
            } else {
                $this->errorMessage = $xmlmcf->errorMessage;
                return false;
            }
        }

        function fetch($rowPos = -1)
        {
            $this->currentRow = null;
            if ($this->response && @$this->response->data && @$this->response->data->rowData && @$this->response->data->rowData->row) {
                if (!is_array($this->response->data->rowData->row)) $this->response->data->rowData->row = Array($this->response->data->rowData->row);

                //-- force fetch of a row pos
                if ($rowPos > -1) $this->currentRowPointer = $rowPos;

                if (@$this->response->data->rowData->row[$this->currentRowPointer]) {
                    $this->currentRow = $this->response->data->rowData->row[$this->currentRowPointer];
                    $this->currentRowPointer++;
                    return new swphpDatabaseQueryRow($this->currentRow, $this->response->data->metaData);

                } else return false;
            } else return false;
        }

        function rowCount()
        {
            if ($this->response && @$this->response->data && @$this->response->data->rowData && @$this->response->data->rowData->row) {
                if (!is_array($this->response->data->rowData->row)) $this->response->data->rowData->row = Array($this->response->data->rowData->row);
                return count($this->response->data->rowData->row);
            }
            return 0;
        }

        function last_insert_id()
        {
            if ($this->response && @$this->response->data && @$this->response->data->generatedId) {
                return $this->response->data->generatedId;
            } else return 0;


            /*
            $xmlmcf = new swphpXmlMethodCall();
            $xmlmcf->SetParam("database",$this->database);
            $xmlmcf->SetParam("query","SELECT LAST_INSERT_ID()");
            if($xmlmcf->Invoke("data","sqlQuery",true))
            {
                $response = json_decode(utf8_encode($xmlmcf->xmlresult));
                if($response->{"@status"}==false)
                {
                    return 0;
                }
                else
                {
                    return $response->data->rowData->row->{"last_insert_id()"};
                }
            }
            else
            {
                return 0;
            }
            */
        }
    }

    class swphpDatabaseQueryRow
    {
        function swphpDatabaseQueryRow($row, $metaData)
        {
            //-- empty properties based on metadata
            foreach ($metaData as $fieldName => $metaInfo) {
                $this->{$fieldName} = "";//($metaInfo->dataType=="string" || $metaInfo->dataType=="varchar")?"":0;
            }

            //-- check if we have raw values
            foreach ($row as $fieldName => $value) {
                if (is_object($value)) {
                    $this->{"@" . $fieldName} = $value->{"@raw"};
                    $this->{$fieldName} = $value->{"#text"};
                } else {
                    if (is_array($value)) $value = $value[0];
                    $this->{$fieldName} = $value;
                }
            }
        }

        function getColumnValue($strCol)
        {
            $rawCol = "@" . $strCol;
            if (isset($this->{$rawCol})) return $this->{$rawCol};
            else @$this->{$strCol};
        }

        function getColumnFormattedValue($strCol)
        {
            return @$this->{$strCol};
        }
    }

    //--
    //-- xmlmc processor - have to use swphp.dll as xmlmc api does not have a method to use existing session
    class swphpXmlMethodCall
    {
        var $errorMessage = "";
        var $swserver = "";
        var $params = Array();
        var $data = Array();
        var $currentState = "";
        var $xmlresult = "";
        var $xmldom = null;

        function swphpXmlMethodCall($server = "127.0.0.1")
        {
            if ($server == "localhost") $server = "127.0.0.1";
            $this->swserver = $server;
        }

        function reset()
        {
            $this->params = Array();
        }

        function SetComplexValue($parentParamName, $paramName, $paramValue)
        {
            if (!isset($this->params[$parentParamName])) $this->params[$parentParamName] = Array();
            $this->params[$parentParamName][$paramName] = $paramValue;
        }

        function SetParam($paramName, $paramValue)
        {
            $this->params[$paramName] = $paramValue;
        }

        function SetDataComplexValue($parentParamName, $paramName, $paramValue)
        {
            if (!isset($this->data[$parentParamName])) $this->data[$parentParamName] = Array();
            $this->data[$parentParamName][$paramName] = $paramValue;
        }

        function SetData($paramName, $paramValue)
        {
            $this->data[$paramName] = $paramValue;
        }

        function GetLastError()
        {
            return $this->errorMessage;
        }

        function pfx($strValue)
        {
            $xmlchars = array("&", "<", ">", "'", '"');
            $escapechars = array("&amp;", "&lt;", "&gt;", "&apos;", "&quot;");
            return str_replace($xmlchars, $escapechars, $strValue);
        }

        //-- return xml string
        function generatexmlcall($service, $method)
        {
            $xml = '<?xml version="1.0" encoding="UTF-8"?>';
            $xml .= "<methodCall service='" . $service . "' method='" . $method . "'>";
            //-- params
            $bParams = false;
            foreach ($this->params as $paramName => $paramValue) {
                if ($bParams == false) {
                    $xml .= "<params>";
                    $bParams = true;
                }
                $xml .= "<" . $paramName . ">" . $this->pfx(utf8_encode($paramValue)) . "</" . $paramName . ">";
            }
            if ($bParams) $xml .= "</params>";

            $bData = false;
            foreach ($this->data as $paramName => $paramValue) {
                if ($bData == false) {
                    $xml .= "<data>";
                    $bData = true;
                }
                $xml .= "<" . $paramName . ">" . $this->pfx(utf8_encode($paramValue)) . "</" . $paramName . ">";
            }
            if ($bData) $xml .= "</data>";

            $xml .= "</methodCall>";
            return $xml;
        }

        function invoke($service, $method, $bAsJson = false)
        {
            $this->errorMessage = "";
            $port = 5015;
            if ($service == "mail" || $service == "addressbook") $port = 5014;
            else if ($service == "calendar") $port = 5013;
            $result = swphp_xmlmc($this->swserver, $port, @$_SESSION['swstate'], $this->generatexmlcall($service, $method), $bAsJson);
            $_SESSION['swstate'] = $result->token;
            $this->currentState = $result->token;
            return $this->_processresultstring($result);
        }

        function _processresultstring($xmlmcResult)
        {
            if ($xmlmcResult == false) {
                $this->xmlresult = swphp_generateCustomErrorString("-300", "Unable to connect to the Supportworks XMLMC. Please check with your Administrator to ensure that the Supportworks Server is operational.");
                $this->errorMessage = "Unable to connect to the Supportworks XMLMC.";
                return false;
            }

            if ($xmlmcResult->status != 200) {
                //-- some http error has occured
                $this->xmlresult = swphp_generateCustomErrorString($xmlmcResult->status, "An http error has occurred. Please contact your Administrator.");
                $this->errorMessage = "A http error has occurred.";
                return false;
            } else {
                //-- get result - convert string to xmldom
                $this->xmlresult = $xmlmcResult->content;
                if ($xmlmcResult->xmldom != null) {
                    $this->xmldom = $xmlmcResult->xmldom->document_element();
                    $status = $this->xmldom->get_attribute('status');
                    if ($status == "fail") {
                        $e = $this->xmldom->get_elements_by_tagname("error");
                        if ($e[0]) {
                            $this->errorMessage = $e[0]->get_content();
                        }
                        return false;
                    } else return true;

                }
                return true;
            }
        }
    }

    function swphp_generateCustomErrorString($code, $msg)
    {
        $msg = $_POST['espQueryName'] . " : " . $msg;
        if ($_POST['asjson']) {
            $xmls = '{"@status":"fail","state":{"code":"' . $code . '","error":"' . $msg . '"}}';
        } else {
            $xmls = "<?xml version='1.0' encoding='utf-8'?>";
            $xmls .= '<methodCallResult status="fail">';
            $xmls .= '<state>';
            $xmls .= '<code>' . $code . '</code>';
            $xmls .= '<error>' . prepareForXml($msg) . '</error>';
            $xmls .= '</state>';
            $xmls .= '</methodCallResult>';
        }
        return $xmls;
    }
}


//-- helpers
function __getSwDatabaseType()
{
    //-- get session info
    return "mysql";

    $xmlmc = new XmlMethodCall();
    if (!$xmlmc->invoke("session", "getSessionInfo2")) {
        echo $xmlmc->xmlresult;
        exit;
    }

    $ora = xcc($xmlmc->xmldom, "oracleInUse");
    $ms = xcc($xmlmc->xmldom, "msSqlInUse");
    if ($ora == 1) return "oracle";
    if ($ms == 1) return "mssql";
    return "mysql";

}

function rrmdir($dir)
{
    if (is_dir($dir)) {
        $objects = scandir($dir);
        foreach ($objects as $object) {
            if ($object != "." && $object != "..") {
                if (filetype($dir . "/" . $object) == "dir") rrmdir($dir . "/" . $object); else unlink($dir . "/" . $object);
            }
        }
        reset($objects);
        rmdir($dir);
    }
}

function currentQuarterStartEnd()
{
    $current_month = date('m');
    $current_year = date('Y');
    if ($current_month >= 1 && $current_month <= 3) {
        $start_date = strtotime('1-January-' . $current_year);  // timestamp or 1-Januray 12:00:00 AM
        $end_date = strtotime('1-April-' . $current_year);  // timestamp or 1-April 12:00:00 AM means end of 31 March
    } else if ($current_month >= 4 && $current_month <= 6) {
        $start_date = strtotime('1-April-' . $current_year);  // timestamp or 1-April 12:00:00 AM
        $end_date = strtotime('1-July-' . $current_year);  // timestamp or 1-July 12:00:00 AM means end of 30 June
    } else if ($current_month >= 7 && $current_month <= 9) {
        $start_date = strtotime('1-July-' . $current_year);  // timestamp or 1-July 12:00:00 AM
        $end_date = strtotime('1-October-' . $current_year);  // timestamp or 1-October 12:00:00 AM means end of 30 September
    } else if ($current_month >= 10 && $current_month <= 12) {
        $start_date = strtotime('1-October-' . $current_year);  // timestamp or 1-October 12:00:00 AM
        $end_date = strtotime('1-January-' . ($current_year + 1));  // timestamp or 1-January Next year 12:00:00 AM means end of 31 December this year
    }
    return array($start_date, $end_date - 1);
}

function lastQuarterStartEnd()
{
    $current_month = date('m');
    $current_year = date('Y');

    if ($current_month >= 1 && $current_month <= 3) {
        $start_date = strtotime('1-October-' . ($current_year - 1));  // timestamp or 1-October Last Year 12:00:00 AM
        $end_date = strtotime('1-January-' . $current_year);  // // timestamp or 1-January  12:00:00 AM means end of 31 December Last year
    } else if ($current_month >= 4 && $current_month <= 6) {
        $start_date = strtotime('1-January-' . $current_year);  // timestamp or 1-Januray 12:00:00 AM
        $end_date = strtotime('1-April-' . $current_year);  // timestamp or 1-April 12:00:00 AM means end of 31 March
    } else if ($current_month >= 7 && $current_month <= 9) {
        $start_date = strtotime('1-April-' . $current_year);  // timestamp or 1-April 12:00:00 AM
        $end_date = strtotime('1-July-' . $current_year);  // timestamp or 1-July 12:00:00 AM means end of 30 June
    } else if ($current_month >= 10 && $current_month <= 12) {
        $start_date = strtotime('1-July-' . $current_year);  // timestamp or 1-July 12:00:00 AM
        $end_date = strtotime('1-October-' . $current_year);  // timestamp or 1-October 12:00:00 AM means end of 30 September
    }

    return array($start_date, $end_date - 1);
}

//--
//-- DATE FORMATTING FUNCTIONS BY FLORIN - JUST DUMP IN IF NOT ALREADY BEING USED
if (!function_exists("SwFormatDateTimeColumn")) {

    //	<FN dt=15-June-2006>

    //	Regular expression constants to be used for matching various date/time values
    //	matches UK formats: dd/MM/yyyy HH:mm:ss
    @define("SW_REGEXP_UK_DTFMT", "(\d{1,2}\\/\d{1,2}\\/\d{4} \d{1,2}:\d{1,2}:\d{1,2})");

    //	matches UK formats printed like: [dd/MM/yyyy HH:mm:ss]-UTC.
    @define("SW_REGEXP_UK_DTFMT_UTC", "(\\[\d{1,2}\\/\d{1,2}\\/\d{4} \d{1,2}:\d{1,2}:\d{1,2}\\]-UTC)");

    //	matches the ISO formats like: [yyyy-MM-dd HH:mm:ss]-UTC.
    @define("SW_REGEXP_ISO8601_DTFMT_UTC", "(\\[\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}\\]-UTC)");

    //	matches the ISO formats like: yyyy-MM-dd HH:mm:ssZ.
    @define("SW_REGEXP_ISO8601_DTFMT_Z", "(\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}Z)");

    //	matches ISO formats like yyyy-mm-ddTHH:mi:ssZ where:
    //	 	* T can be replaced by space or
    //		* both T and Z could miss or
    //		* any or all of the - and : delimiters could miss
    @define("SW_REGEXP_ISO8601_DTFMT", "(\d{4}-?\d{2}-?\d{2}[T ]?\d{2}:?\d{2}:?\d{2}Z?)");

    //	Constants for identifying the control types in data dictionary. The values are from SwCoreLib, file SwColumnDesc.h
    //	They are used by the extension DLL, returned by function [swdti_getfieldtype].
    //	Example:
    //		swdti_getfieldtype("opencall.logdatex") == SWCD_CONTROL_DATETIMECTRL

    @define("SWCD_CONTROL_EDIT", 0);        // Standard Edit property
    @define("SWCD_CONTROL_COMBO", 1);    // Standard Combo list
    @define("SWCD_CONTROL_FLAGCOMBO", 2);        // Flags Combo
    @define("SWCD_CONTROL_DISTCOMBO", 3);        // Distinct SQL combo
    @define("SWCD_CONTROL_PASSWORDEDIT", 4);        // Single line password edit field
    @define("SWCD_CONTROL_DATETIMECTRL", 5);    // Date/Time Picker
    @define("SWCD_CONTROL_YESNO", 6);    // True/False or Yes/No picker
    @define("SWCD_CONTROL_ICON", 7);    // Image control for displaying icons
    @define("SWCD_CONTROL_DISTCOMBOWITHICON", 8);        // Distinct SQL combo with Icon image
    @define("SWCD_CONTROL_DISTCOMBODUALVALUE", 9);        // Distinct SQL combo that holds two values per item (e.g. CODE/DESCRIPTION)
    @define("SWCD_CONTROL_FORMFLAGS", 10);    // Same as flags combo but flags are displayed on the form
    @define("SWCD_CONTROL_SWEMAILADDRESS", 11);    // Display/Pick an e-mail address from the GAL
    @define("SWCD_CONTROL_INCLUDEEXCLUDELIST", 12);    // Displays a list of items to include/exclude. result list is stored as a comma separated list
    @define("SWCD_CONTROL_PICKLISTEDITOR", 13);    // Displays an editable list of items/value to display in a pick list combo
    @define("SWCD_CONTROL_FLAGLISTEDITOR", 14);    // Displays an editable list of items/value to display in a flag list combo
    @define("SWCD_CONTROL_SECONDTIMEPERIOD", 15);    // Displays a time period in h:mm:ss
    @define("SWCD_CONTROL_MINUTETIMEPERIOD", 16);    // Displays a time period in h:mm
    @define("SWCD_CONTROL_COMBO2", 17);    // Displays an editable list of text values to display in a pick list combo
    @define("SWCD_CONTROL_LOCDISTCOMBO", 18);    // Distinct pick list for local ODBC databases

    //	Constants for identifying the column data types in data dictionary. The values are from SwCoreLib, file SwVariable.h
    //	Not all of them are listed here. They are used by the extension DLL, returned by function [swdti_getdatatype].
    //	Example:
    //		swdti_getdatatype("opencall.logdatex") == VT_V_DWORD
    @define("VT_V_STRING", 0x0008);
    @define("VT_V_DWORD", 0x0012);
    @define("VT_V_DOUBLE", 0x0016);

    //	Constants for identifying the time tokens. It is used with [SwFormatDateTimeColumn], please see the comments of this function.
    @define("SW_DTFMT_TOKEN_YEAR", 0x0001);
    @define("SW_DTFMT_TOKEN_MONTH", 0x0002);
    @define("SW_DTFMT_TOKEN_DAY", 0x0004);
    @define("SW_DTFMT_TOKEN_HOURS", 0x0008);
    @define("SW_DTFMT_TOKEN_MINUTES", 0x0010);
    @define("SW_DTFMT_TOKEN_SECONDS", 0x0020);
    @define("SW_DTFMT_TOKEN_AMPM", 0x0040);

    //	Constants for Date/Time modes - returned by PHP extension function [swdti_getdtmode]
    @define("SW_DTMODE_DATETIME", 0);
    @define("SW_DTMODE_DATEONLY", 1);
    @define("SW_DTMODE_TIMEONLY", 2);
    @define("SW_DTMODE_CUSTOM", 3);

    //	Constants for various Date/Time formats
    @define("SW_DTFMT_PHP_ISO8601", "Y-m-d H:i:s");
    @define("SW_DTFMT_COMCTRL32_ISO8601", "yyyy-MM-dd HH:mm:ss");
    @define("SW_DTFMT_COMCTRL32_ISO8601_DATE", "yyyy-MM-dd");
    @define("SW_DTFMT_COMCTRL32_ISO8601_TIME", "HH:mm:ss");
    @define("SW_DTFMT_COMCTRL32_UK", "dd/MM/yyyy HH:mm:ss");

    @define("SW_DEFAULT_DATA_DICTIONARY_NAME", "Default");
    @define("SW_DEFAULT_TIMEZONE_NAME", "GMT Standard Time");
    @define("SW_DEFAULT_TIMEZONE_OFFSET", 0);

    //	Error constant returned by [SwGetTimezoneOffset] function
    @define("SW_GET_TZ_OFFSET_ERROR", -999999);

    //	Error constant returned by [SwGetCrtTimezoneOffset] function
    @define("SW_ERR_GET_CRT_TIMEZONE_OFFSET", -9999999);

    //	Error messages
    @define("SW_FAIL_TO_DEDUCE_TIMEZONE", "<B>Warning:</B> The timezone offset failed to be deduced for time zone [%s]. As a result no time zone offset has been applied and all date/time fields are displayed in UTC.");
    @define("SW_REPORTS_FAIL_TO_DEDUCE_RUNNING_MODE", "<B>Warning:</B> The report is running in neither interactive or scheduled mode. Time zone used = [%s], all date/time fields are displayed using [%s] format and against the [%s] data dictionary.");
    @define("SW_REPORTS_NO_TIMEZONE", "<B>Warning:</B> The report is running in scheduled mode and the timezone parameter has not been passed in URL. The default value [%s] is used in place.");
    @define("SW_REPORTS_NO_DATETIME_FMT", "<B>Warning:</B> The report is running in scheduled mode and the date/time format parameter has not been passed in URL. The default value [%s] is used in place.");
    @define("SW_REPORTS_NO_DATA_DICTIONARY", "<B>Warning:</B> The report is running in scheduled mode and the data dictionary parameter has not been passed in URL. The default value [%s] is used in place.");
    @define("SW_NO_CUSTOM_FORMAT", "[Custom DateTime field must set CustomFormat]");
    @define("SW_ERR_SWDTI_OFFSET_TIME_FAILED", "Offset to timezone failed");
    @define("SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED", "SWDTI_TIMEFROMSTRING_UK failed");
    @define("SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED", "SWDTI_TIMEFROMSTRING_ISO failed");
    @define("SW_ERR_GET_CRT_TIMEZONE_FAILED", "SwGetCrtTimezoneOffset failed");

    function remove_phpdtfmt_token($strDateTimePhpFormat, $arTokens, $arSeparators)
    {
        foreach ($arTokens as $chToken) {
            $nTokenPos = strpos($strDateTimePhpFormat, $chToken);
            if ($nTokenPos === false)
                continue;

            // trim separators on left side
            if ($nTokenPos - 1 >= 0) {
                if (in_array($strDateTimePhpFormat[$nTokenPos - 1], $arSeparators)) {
                    $strDateTimePhpFormat = substr_replace($strDateTimePhpFormat, "", $nTokenPos - 1, strlen($chToken) + 1);
                    continue;
                }
            }

            // trim separators on right side
            if ($nTokenPos + 1 <= strlen($strDateTimePhpFormat)) {
                if (in_array($strDateTimePhpFormat[$nTokenPos + 1], $arSeparators)) {
                    $strDateTimePhpFormat = substr_replace($strDateTimePhpFormat, "", $nTokenPos, strlen($chToken) + 1);
                    continue;
                }
            }
        }
        return $strDateTimePhpFormat;
    }

    //	The function returns a string from which the tokens specified in [$nTokensToBeExcluded] were removed.
    //	[nTokensToBeExcluded] is a mask made of a "bitwise or" combination of any of the above DTFMT_TOKEN_ constants
    //	[$strDateTimePhpFormat] must be a string in PHP format style used by time formatting functions, like "Y-m-d H:i:s"
    //	These characters are considered to be separators of the tokens: "-/\\:_.,%*|"
    //	Example: to get the DT format without the year and seconds tokens, use:
    //		ExcludeDateTimeTokens("Y-m-d H:i:s", SW_DTFMT_TOKEN_YEAR | SW_DTFMT_TOKEN_SEC) == "m-d H:i"

    //	When [$nTokensToBeExcluded] contains valid DT tokens to be excluded, then [$strDateTimePhpFormat] should contain only date/time tokens.
    //	No other padding text should be included. E.g. passing a string like [$strDateTimePhpFormat] = "This is day d of month m" would not return the expected results :(

    function ExcludePhpDateTimeFormatTokens($strDateTimePhpFormat, $nTokensToBeExcluded)
    {
        if ($nTokensToBeExcluded == 0x0000) // no token specified
            return $strDateTimePhpFormat;

        //$arPhpDateTimeFormatTokens = array("Y", "y", "F", "M", "m", "n", "l", "D", "d", "j", "H", "G", "h", "g", "i", "s", "A", "a");
        $arDtFmtSeparators = array("-", "/", "\\", ":", "_", ".", ",", "%", "*", "|");

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_YEAR) // remove the year token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("Y", "y"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_MONTH) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("F", "M", "m", "n"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_DAY) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("l", "D", "d", "j"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_HOURS) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("H", "G", "h", "g"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_MINUTES) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("i"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_SECONDS) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("s"), $arDtFmtSeparators);

        if ($nTokensToBeExcluded & SW_DTFMT_TOKEN_AMPM) // remove the month token
            $strDateTimePhpFormat = remove_phpdtfmt_token($strDateTimePhpFormat, array("A", "a"), $arDtFmtSeparators);

        return $strDateTimePhpFormat;
    }

    /*	[$strComCtrl32Format] is the format in ComCtrl32 style:
    Year tokens
        yyyy : Year with century, as decimal number
        yy : Year without century, as decimal number (00 - 99)

    Month tokens
        MMMM : Full month name
        MMM : Abbreviated month name
        MM : Month as decimal number (01 - 12)
        M : Month as decimal number, with the leading zero removed

    Day tokens
        dddd : Full weekday name
        ddd : Abbreviated weekday name
        dd : Day of month as decimal number (01 - 31)
        d : Day of month as decimal number, with the leading zero removed

    Hour tokens
        HH : Hour in 24-hour format (00 - 23)
        H : Hour in 24-hour format, with the leading zero removed
        hh : Hour in 12-hour format (01 - 12)
        h : Hour in 12-hour format, with the leading zero removed

    Minutes tokens
        mm : Minute as decimal number (00 - 59)
        m : Minute as decimal number, with the leading zero removed

    Seconds tokens
        ss : Second as decimal number (00 - 59)
        s : Second as decimal number, with the leading zero removed

    AM-PM token
        tt : Current locale's A.M./P.M. indicator for 12-hour clock

    The function returns the format converted in Php style. Example: ComCtrl32Format_To_PhpFormat("yyyy-MM-dd HH:mm:ss") == "Y-m-d H:i:s"
    */

    function ComCtrl32Format_To_PhpFormat($strComCtrl32Format)
    {
        $arComCtrl32Formats = array(
            "yyyy", "yy",
            "MMMM", "MMM", "MM", "M",
            "dddd", "ddd", "dd", "d",
            "HH", "H", "hh", "h",
            "mm", "m",
            "ss", "s",
            "tt", "t"
        );
        $arPhpFormats = array(
            "Y", "y",
            "F", "M", "@111@", "n",
            "l", "D", "@222@", "j",
            "@333@", "G", "h", "g",
            "i", "i",
            "s", "s",
            "A", "a"
        );

        $res = str_replace($arComCtrl32Formats, $arPhpFormats, $strComCtrl32Format);

        // Replace the temporary strings ...
        $arComCtrl32Formats = array("@111@", "@222@", "@333@");
        $arPhpFormats = array("m", "d", "H");

        return str_replace($arComCtrl32Formats, $arPhpFormats, $res);
    }

    //	--------------------------------------------------------------------------------------
    //	SwFormatDateTimeColumn
    //	--------------------------------------------------------------------------------------
    //	[$column]: must be passed in as "table_name.column_name"
    //		Current data dictionary is the one loaded using [swdti_load]. It must be loaded before calling this function.

    //	[$vDateTimeValue]:	variant (integer or string). If data type of the column in data dictionary is:
    //		- VT_V_DWORD then [$vDateTimeValue] must hold a valid UTC Unix unsigned integer date/time (time_t style).
    //		- VT_V_STRING then [$vDateTimeValue] must hold a valid formatted date/time string which meets the next conditions:
    //			* is always in UK format, e.g 14/07/2006 11:12:41
    //			* is always in UTC (created by Helpdesk server, using CSwTime::FormatGmt function)

    //	[nTokensToBeExcluded] is a mask made of a "bitwise or" combination of any of the above DTFMT_TOKEN_ constants
    //		For example to exclude the years and seconds use it like:
    //			SwFormatDateTimeColumn("opencall.logdatex", $logdatex, SW_DTFMT_TOKEN_YEAR|SW_DTFMT_TOKEN_SECONDS);
    //		Please take into account that the next characters are all considered separators of the tokens: "-/\\:_.,%*|".

    //	Examples:
    //		In both analyst portal and helpdesk client (active pages) call it like:
    //		 	$sFormattedDateTime = SwFormatDateTimeColumn("opencall.logdatex", $logdatex);	// time_t style version
    //		 	$sFormattedDateTime = SwFormatDateTimeColumn("opencall.logdate", "14/07/2006 11:12:41");	// UTC formatted string version

    //	Observations:
    //	1. Reason for not having YET a PHP extension function to format a date/time column, like: swdti_formatdatetime_column($column, $value, $format, $tzoffset);
    //	To update the extension DLL we need to stop the HTTP server and in case of mistakes or other specific customizations
    //	required by web pages I wanted to allow easy modifications of PHP files without stoping the HTTP server!
    //	Such, I've broken down in pieces the information that I needed from helpdesk server and I implemented the formatting function in plain PHP.
    //	In case we won't need any more specific customization in web applications then the extension function should implement
    //	same behavior as the PHP one. The extension function will also be much faster!

    //	TO DO: clarify the bahavior for [selfservice] web pages - for moment the associated data dictionary is unclear!
    //	Probably no DD will be used and then [SwFormatDateTimeValue] should be used.

    //	16-Oct-2006: The column [sw_sessions.TimeZoneOffset] is NOT USED ANYMORE!
    //	So, $GLOBALS['tz'] and $GLOBALS['config_tz'] are obsolete from now on!

    function SwFormatDateTimeColumn($column, $vDateTimeValue, $nTokensToBeExcluded = 0x0000, $strTimeZone = "")
    {

        if (is_null($vDateTimeValue) || $vDateTimeValue == 0 || $vDateTimeValue == "")
            return "";

        if ($strTimeZone == "") {
            global $timezone;
            $strTimeZone = $timezone;
        }


        $nUtcUnixDate = -1;
        $colType = swdti_getdatatype($column);
        switch ($colType) // [is_integer] available in PHP is just beyond the purpose of this function!
        {
            case VT_V_STRING:
                //	[swdti_timefromstring_uk] converts a Date/Time string represented in UK format to the Unix number.
                //	the last parameter (boolean) specifies whether the string is in UTC (pass value 1) or in local time (pass value 0)
                $nUtcUnixDate = swdti_timefromstring_uk($vDateTimeValue, 1); // use the UTC version as the string values are inserted in DB in UTC!
                if ($nUtcUnixDate == -1)
                    return "<Conversion of Obsolete Date/Time String Failed>";
                break;
            case VT_V_DWORD: //nothing else to do - this is what I expect!
                $nUtcUnixDate = intval($vDateTimeValue);
                break;
            default:
                return "<Invalid Data Type>";
        }

        //	set the global variable names used to retrieve the analyst's format
        //	for a reason?, SwAnalystSessionManager inserts them prefixed by [config_] :(
        $prefix = "";
        $useVariableArray = &$GLOBALS;
        if (array_key_exists('config_datetimefmt', $GLOBALS)) $prefix = 'config_';
        if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION)) {
            $useVariableArray = &$_SESSION;
            $prefix = 'wc_';
        }

        //	[$strComCtrl32Format] is the format in ComCtrl32 style, like yyyy-MM-dd HH:mm:ss
        $strComCtrl32Format = "";    //SW_DTFMT_COMCTRL32_ISO8601;
        $dateControlMode = swdti_getdtmode($column);
        switch ($dateControlMode) {
            case SW_DTMODE_DATETIME:    //DateTime
                $strComCtrl32Format = $useVariableArray[$prefix . 'datetimefmt'];
                break;
            case SW_DTMODE_DATEONLY:    // Date
                $strComCtrl32Format = $useVariableArray[$prefix . 'datefmt'];
                break;
            case SW_DTMODE_TIMEONLY:    // Time
                $strComCtrl32Format = $useVariableArray[$prefix . 'timefmt'];
                break;
            case SW_DTMODE_CUSTOM:    // Custom Format in DD takes precedence over the session parameters;
                // in this case if in DD [Custom Format] is left blank, then the field will be displayed blank!
                $strComCtrl32Format = swdti_getdtformat($column);
                if ($strComCtrl32Format == "")
                    return SW_NO_CUSTOM_FORMAT;
                else
                    break;
        }
        //echo swdti_getdtmode($column);
        $strPhpFormat = ComCtrl32Format_To_PhpFormat($strComCtrl32Format);
        if ($nTokensToBeExcluded != 0x0000)
            $strPhpFormat = ExcludePhpDateTimeFormatTokens($strPhpFormat, $nTokensToBeExcluded);

        //	[$nTimezone]:		INTEGER - a valid timezone offset in seconds.
        //		Must be a positive value (+) for Eastern time zones (GMT + x) and negative value (-) for Western time zones (GMT - x)
        //		For example, if the desired timezone is GMT+02:00, then
        //		[$nTimezone] == 10800 seconds (3 hours) if [$nUtcUnixDate] is IN Daylight Saving Time, OR
        //					 == 7200 seconds (2 hours) if [$nUtcUnixDate] is NOT IN Daylight Saving Time.

        //NEW - using the time zone name!

        $nTime = swdti_offset_time($strTimeZone, $nUtcUnixDate);
        if ($nTime < 0)
            return SW_ERR_SWDTI_OFFSET_TIME_FAILED;

        return gmdate($strPhpFormat, $nTime);

    }

    //	this function is internal to this file
    function pvGetSessionDateTimeFormat($dtMode)
    {
        //	for a reason?, SwAnalystSessionManager inserts them prefixed by [config_] :(
        $prefix = "";
        $useVariableArray = &$GLOBALS;
        if (array_key_exists('config_datetimefmt', $GLOBALS)) $prefix = 'config_';
        if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION)) {
            $useVariableArray = &$_SESSION;
            $prefix = 'wc_';
        }

        $strComCtrl32Format = "";    //SW_DTFMT_COMCTRL32_ISO8601;
        switch ($dtMode) {
            case SW_DTMODE_DATETIME:    //DateTime
                if (!$useVariableArray[$prefix . 'datetimefmt'])
                    $strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601;
                else
                    $strComCtrl32Format = $useVariableArray[$prefix . 'datetimefmt'];
                break;
            case SW_DTMODE_DATEONLY:    // Date
                if (!$useVariableArray[$prefix . 'datefmt'])
                    $strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601_DATE;
                else
                    $strComCtrl32Format = $useVariableArray[$prefix . 'datefmt'];
                break;
            case SW_DTMODE_TIMEONLY:    // Time
                if (!$useVariableArray[$prefix . 'timefmt'])
                    $strComCtrl32Format = SW_DTFMT_COMCTRL32_ISO8601_TIME;
                else
                    $strComCtrl32Format = $useVariableArray[$prefix . 'timefmt'];
                break;
            default:                    //	no support for any other formats!!!
                return "Unsupported [dtMode]";
        }

        $strPhpFormat = ComCtrl32Format_To_PhpFormat($strComCtrl32Format);
        return $strPhpFormat;
    }

    //	It formats only simple UTC Unix time_t values using a custom time zone and the analyst's DT formats.
    //	Data Dictionary is not considered. Such function is needed by SLA Diagnostic page (sladiag.php).
    //	Parameters:
    //		[$dtMode]: 			One of SW_DTMODE_ constants, but SW_DTMODE_CUSTOM is not supported, as it is beyond the purpose of this function!!!
    //		[$nUtcUnixDate]:	UNSIGNED INTEGER - a valid UTC Unix date/time (time_t).
    //		[$sTimezoneName]:	STRING - a valid timezone name from column [system_timezones.name]
    //							If it is not provided (null or empty string), [nUtcUnixDate] value will be formatted as is - i.e. no time zone offset is applied.
    function SwFormatTimestampValue($dtMode, $nUtcUnixDate, $sTimezoneName = "")
    {
        if (is_null($nUtcUnixDate) || $nUtcUnixDate == 0 || $nUtcUnixDate == "")
            return "";

        if (is_null($sTimezoneName) || $sTimezoneName == "") {
            $nTime = $nUtcUnixDate;
        } else {
            $nTime = swdti_offset_time($sTimezoneName, $nUtcUnixDate);
            if ($nTime < 0)
                return SW_ERR_SWDTI_OFFSET_TIME_FAILED;
        }

        $strPhpFormat = pvGetSessionDateTimeFormat($dtMode);
        return gmdate($strPhpFormat, $nTime);
    }

    // Format an UTC Unix time_t according to the currently logged in analyst settings in swsessions: date/time format + timezone name
    //		[$dtMode]: 			One of SW_DTMODE_ constants, but SW_DTMODE_CUSTOM is not supported, as it is beyond the purpose of this function!!!
    //		[$nUtcUnixDate]:	UNSIGNED INTEGER - a valid UTC Unix date/time (time_t).
    function SwFormatAnalystTimestampValue($dtMode, $nUtcUnixDate)
    {
        //	for a reason?, SwAnalystSessionManager prefixes the global variables by [config_] :(
        $prefix = "";
        $useVariableArray = &$GLOBALS;
        if (array_key_exists('config_datetimefmt', $GLOBALS)) $prefix = 'config_';
        if (isset($_SESSION) && array_key_exists('wc_datetimefmt', $_SESSION)) {
            $useVariableArray = &$_SESSION;
            $prefix = 'wc_';
        }

        return SwFormatTimestampValue($dtMode, $nUtcUnixDate, $useVariableArray[$prefix . 'timezone']);
    }

    //	[$sTimezoneName] => The time zone name from DB column system_timezones.name
    //	Retrieves the time-zone offset between [sTimezoneName] and UTC (GMT Standard, without the extra hour of DST)
    //	It retrieves it in seconds, positive value (+) for Eastern time zones and negative value (-) for Western time zones.
    //	If the time held is in Daylight Savings, the appropriate shift is applied.
    function SwGetCrtTimezoneOffset($sTimezoneName)
    {
        $ret = swdti_get_crt_timezone_offset($sTimezoneName);
        if ($ret == SW_ERR_GET_CRT_TIMEZONE_OFFSET)
            return SW_ERR_GET_CRT_TIMEZONE_FAILED;
        else
            return $ret;
    }


    //	the function is internal to this file
    //	[preg_replace_callback] passes in $matches[0] as a string in this format [dd/MM/yyyy HH:mm:ss]-UTC
    function pv_replace_uk_fmt_utc($matches)
    {
        $sDateTimeValue = substr($matches[0], 1, strlen($matches[0]) - 6);
        $nUtcUnixDate = swdti_timefromstring_uk($sDateTimeValue, 1);
        if ($nUtcUnixDate < 0)
            return SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED;
        return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
    }

    //	the function is internal to this file
    //	[preg_replace_callback] passes in $matches[0] as a string in this format dd/MM/yyyy HH:mm:ss
    function pv_replace_uk_fmt($matches)
    {
        $sDateTimeValue = $matches[0];
        $nUtcUnixDate = swdti_timefromstring_uk($sDateTimeValue, 1);
        if ($nUtcUnixDate < 0)
            return SW_ERR_SWDTI_TIMEFROMSTRING_UK_FAILED;
        return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
    }

    //	the function is internal to this file
    //	[preg_replace_callback] passes in $matches[0] as a string in this format [yyyy-MM-dd HH:mm:ss]-UTC
    function pv_replace_iso_fmt_utc($matches)
    {
        $sDateTimeValue = substr($matches[0], 1, strlen($matches[0]) - 6);
        $nUtcUnixDate = swdti_timefromstring_iso($sDateTimeValue);
        if ($nUtcUnixDate < 0)
            return SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED;
        return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
    }

    //	the function is internal to this file
    //	[preg_replace_callback] passes in $matches[0] as a string in this format yyyy-MM-dd HH:mm:ssZ
    function pv_replace_iso_fmt_z($matches)
    {
        $sDateTimeValue = substr($matches[0], 0, strlen($matches[0]) - 1);
        $nUtcUnixDate = swdti_timefromstring_iso($sDateTimeValue);
        if ($nUtcUnixDate < 0)
            return SW_ERR_SWDTI_TIMEFROMSTRING_ISO_FAILED;
        return SwFormatAnalystTimestampValue(SW_DTMODE_DATETIME, $nUtcUnixDate);
    }

    //	It replaces all occurences of UK-style date/time values with  values converted according to the
    //	current logged in analyst's regional settings.
    //	The function looks only for the next patterns:
    //	dd/MM/yyyy HH:mm:ss, [dd/MM/yyyy HH:mm:ss]-UTC, [yyyy-MM-dd HH:mm:ss]-UTC or yyyy-MM-dd HH:mm:ssZ
    //	All date/time values that match these patterns are supposed to be represented in UTC and are treated as such.
    //	It returns the resulted text.
    function SwConvertDateTimeInText($subject)
    {
        $subject = preg_replace_callback(SW_REGEXP_UK_DTFMT_UTC, "pv_replace_uk_fmt_utc", $subject);
        //$subject = preg_replace_callback(SW_REGEXP_UK_DTFMT, pv_replace_uk_fmt, $subject);
        $subject = preg_replace_callback(SW_REGEXP_ISO8601_DTFMT_UTC, "pv_replace_iso_fmt_utc", $subject);
        $subject = preg_replace_callback(SW_REGEXP_ISO8601_DTFMT_Z, "pv_replace_iso_fmt_z", $subject);
        return $subject;
    }
}

//-- activepage session
class swClassActivePageSession
{
    var $sessid;
    var $sessionok;

    function swClassActivePageSession($sessid)
    {
        $this->sessid = $sessid;
        //use logon
        $sessionok = FALSE;

        if (!isset($_SESSION['swstate'])) {
            $xmlmc = new swphpXmlMethodCall();
            $xmlmc->SetParam("sessionId", PrepareForSql($sessid));
            if ($xmlmc->Invoke("session", "bindSession", true)) {
                $response = json_decode(utf8_encode($xmlmc->xmlresult));
                if ($response->{"@status"} == false) {
                    return false;
                }
            } else {
                return FALSE;
            }
        }

        //-- Load our session configuration
        $this->LoadSessionConfig();
        //-- NWJ
        //-- setup any session variables that will be useful
        //--  set portal mode so can use in other pages to id what we are doing
        $_SESSION['portalmode'] = "FATCLIENT";
        $_SESSION['server_name'] = "localhost";
        return TRUE;
    }

    function IsValidSession()
    {
        //  if($this->sessionok)
        //	return TRUE;
        //return FALSE;
        return $this->sessionok;
    }

    function LoadSessionConfig()
    {
        $xmlmc = new swphpXmlMethodCall();
        $xmlmc->Invoke("session", "getSessionInfo2");
        $strLastError = $xmlmc->GetLastError();
        if ($strLastError == "") {
            $sessionok = true;
            $arrRows = $xmlmc->xmldom->get_elements_by_tagname("params");
            foreach ($arrRows as $cats) {
                $children = $cats->child_nodes();
                $dTotal = count($children);
                $catItem = array();
                for ($i = 0; $i < $dTotal; $i++) {
                    $colNode = $children[$i];
                    if ($colNode->node_name() != "#text" && $colNode->node_name() != "#comment") {
                        $strColName = $colNode->tagname();
                        $strColName = strtolower($strColName);
                        if ($strColName == 'currentdatadictionary')
                            $strColName = 'dd';
                        $GLOBALS[$strColName] = $colNode->get_content();
                        $_SESSION['wc_' . $strColName] = $colNode->get_content();
                    }
                }
            }
            $this->sessionok = TRUE;
        }
        $GLOBALS["analystid"] = strtolower($GLOBALS["analystid"]);
        swdti_load($_SESSION['wc_dd']);
    }
}

function swphpExecuteXmlmcFromXmlInfo($xmlmcInfo, $strResultRecordPath = "")
{
    $strService = $xmlmcInfo->get_attribute("service");
    $strMethod = $xmlmcInfo->get_attribute("method");

    $xmlmc = new swphpXmlMethodCall();

    $xmlParams = $xmlmcInfo->child_nodes();
    foreach ($xmlParams as $aParam) {
        if ($aParam->tagname == "") continue;

        //-- get parameter value - if blank ignore
        $varValue = @$_POST[$aParam->get_content()];
        if (isset($varValue)) {
            //-- prepare value
            $xmlmc->SetParam($aParam->tagname, $varValue);
        }
    }

    if ($xmlmc->invoke($strService, $strMethod, true)) {
        $response = json_decode(utf8_encode($xmlmc->xmlresult));
        if ($response->{"@status"} == false) {
            return false;
        } else {
            if ($strResultRecordPath != "") {
                //-- we have info to get response record i.e. row of messages for example
                $arrPath = explode(".", $strResultRecordPath);
                $boolFound = false;
                $rowObject = $response;
                for ($x = 0; $x < sizeof($arrPath); $x++) {
                    if (@$rowObject->{$arrPath[$x]}) {
                        $boolFound = true;
                        $rowObject = $rowObject->{$arrPath[$x]};
                    } else break;
                }

                if ($boolFound) {
                    if (!is_array($rowObject)) $rowObject = Array($rowObject);
                    return $rowObject;
                } else return Array();
            } else return $response;
        }
    } else return false;
}

function register_globals($order = 'egpcs')
{
    // define a subroutine
    if (!function_exists('register_global_array')) {
        function register_global_array(array $superglobal)
        {
            foreach ($superglobal as $varname => $value) {
                global $$varname;
                $$varname = $value;
            }
        }
    }

    $order = explode("\r\n", trim(chunk_split($order, 1)));
    foreach ($order as $k) {
        switch (strtolower($k)) {
            case 'e':
                register_global_array($_ENV);
                break;
            case 'g':
                register_global_array($_GET);
                break;
            case 'p':
                register_global_array($_POST);
                break;
            case 'c':
                register_global_array($_COOKIE);
                break;
            case 's':
                register_global_array($_SERVER);
                break;
        }
    }
}

function unregister_globals()
{
    if (ini_get(register_globals)) {
        $array = array('_REQUEST', '_SESSION', '_SERVER', '_ENV', '_FILES');
        foreach ($array as $value) {
            foreach ($GLOBALS[$value] as $key => $var) {
                if ($var === $GLOBALS[$key]) {
                    unset($GLOBALS[$key]);
                }
            }
        }
    }
}

?>