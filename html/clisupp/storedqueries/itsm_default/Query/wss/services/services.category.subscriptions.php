<?php
//Stored query modidied to work strange characters
//Get Session UserID
$strCustId = strtolower(trim($session->selfServiceCustomerId));
$strInstanceID = $session->analystId;

//----- SQL Injection & session checks
$boolNoSQLInjection = true;
$strWssCustId = strtolower(trim($_POST['custid']));
$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId, "sqlparamstrict") : false);

//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
if ($strCustId != $strWssCustId) {
    IncludeApplicationPhpFile("itsm.helpers.php");
    //Get customer ID field for instance
    $strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if ($strWssCustId == "") {
        echo generateCustomErrorString("-303", "User Verification Error. Cannot match Customer [" . $strWssCustId . "] in database. Please contact your Administrator.");
        exit(0);
    }
}

if (!$boolNoSQLInjection) {
    echo generateCustomErrorString("-303", "Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
    exit(0);
}

//Get Subscribed Service IDs
IncludeApplicationPhpFile("service.helpers.php");
$service = new serviceFunctions();
$serviceKeys = $service->get_customer_services($strWssCustId, true, false);

if ($serviceKeys == "") {
    throwSuccess();
}

IncludeApplicationPhpFile("paging.helpers.php");


$oUserInfo = get_record("userdb", $strCustId);

//Build SQL to get subscription catalog types
$strCols = <<<sql
SELECT sc_typei.fk_config_type,
	   sc_typei.www_image_path,
	   sc_typei.notes,
	   config_itemi.catalog_type

sql;

$strFromTable = <<<sql
FROM config_itemi 
JOIN sc_typei ON sc_typei.pk_config_type = config_itemi.catalog_type

sql;
$strWhere = <<<sql
WHERE sc_typei.pk_config_type = config_itemi.catalog_type
AND config_itemi.pk_auto_id in ($serviceKeys)
AND (config_itemi.flg_invisible_public IS NULL OR config_itemi.flg_invisible_public=0)
AND config_itemi.status_portfolio = 'Catalog' 
sql;
//We don't want to show these services in the new mockup

//Add to show the services's categories belongs to Add Services tab (services.unsub)
//	$strWhere .= " OR config_itemi.pk_auto_id IN (
//												 SELECT fk_service
//												 FROM sc_subscription, config_itemi, sc_folio
//												 WHERE sc_folio.fk_cmdb_id = sc_subscription.fk_service AND config_itemi.pk_auto_id = sc_subscription.fk_service
//				  									   AND rel_type='VIEW' AND (service_archived IS NULL OR service_archived != 1)
//				  									   AND FK_SERVICE NOT in (".$serviceKeys.")
//				  									   AND ((fk_me_table = 'userdb' AND fk_me_key = '".$strCustId."') OR (fk_me_table = 'department' AND fk_me_key in ('".$oUserInfo['department']."')) OR
//														   (fk_me_table = 'company' AND fk_me_key = '".$oUserInfo['fk_company_id']."'))
//				  								 )";


$strGroupBy = " GROUP BY sc_typei.pk_config_type,sc_typei.fk_config_type,config_itemi.catalog_type";
$strOrderBy = " ORDER BY config_itemi.catalog_type ASC ";
//Execute SQL
$sqlDatabase = "swdata";
$sqlCommand = $strCols . $strFromTable . $strWhere . $strGroupBy . $strOrderBy;