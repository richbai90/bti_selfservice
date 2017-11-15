<?php
	//Stored query modidied to work strange characters
	//Get Session UserID
	$strCustId = strtolower(trim($session->selfServiceCustomerId));
	$strInstanceID = $session->analystId;

	//----- SQL Injection & session checks
	$boolNoSQLInjection = true;
	$strWssCustId = strtolower(trim($_POST['custid']));
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strWssCustId,"sqlparamstrict") : $boolNoSQLInjection);

	$intNumRecords = $_POST['records'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intNumRecords,"num") : $boolNoSQLInjection);
	$intPageNo = $_POST['start'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($intPageNo,"num") : $boolNoSQLInjection);

	//Get Keysearch from Userdb for session customer if passed through custid doesn't match session ID
	if($strCustId != $strWssCustId) {
		IncludeApplicationPhpFile("itsm.helpers.php");
		//Get customer ID field for instance
		$strWssCustId = wssGetUserid($strInstanceID, $strCustId);
    if($strWssCustId == "") {
      echo generateCustomErrorString("-303","User Verification Error. Cannot match Customer [".$strWssCustId."] in database. Please contact your Administrator.");
      exit(0);
    }
	}

	//Dynamic customer filter
	$strDynFilter = $_POST['dynfilter'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strDynFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strDynFilter != "") {
		$strDynFilter = utf8_decode($strDynFilter);
		$strDynFilter = " AND (	sc_typei.type_display LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_title LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR vsb_description LIKE '%".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw1 LIKE '".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw2 LIKE '".PrepareForSQL($strDynFilter)."%'
														OR sc_folio.fld_kw3 LIKE '".PrepareForSQL($strDynFilter)."%' )";
	}

	//Filter by category
	$strCatFilter = $_POST['cat'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strCatFilter,"sqlparamstrict", true) : $boolNoSQLInjection);
	if ($strCatFilter != "") {
		$strCatFilter = " AND sc_typei.pk_config_type = '".PrepareForSql($strCatFilter)."'";
	}

	//Filter by Favourites
	$strFavServices = $_POST['favstr'];
	$boolNoSQLInjection = ($boolNoSQLInjection ? _validate_url_param($strFavServices,"sqlselectcolumns", true) : $boolNoSQLInjection);
	if ($strFavServices != "") {
	    $now = time();
	    $three_months_ago = strtotime('3 months ago');
		$strFavServices = " AND config_itemi.pk_auto_id IN (SELECT itsm_fk_service from opencall where itsm_fk_service is not null and cust_id = '$strWssCustId' and logdatex >= $three_months_ago and logdatex <= $now group by itsm_fk_service order by COUNT(callref) desc limit 10 ) ";
		if($session->msSqlInUse) {
		    $strFavServices = " AND config_itemi.pk_auto_id in (SELECT TOP 10 itsm_fk_service from opencall where itsm_fk_service is not null and cust_id = '$strWssCustId' and logdatex >= $three_months_ago and logdatex <= $now group by itsm_fk_service having COUNT(callref) > 0 order by Count(callref) desc) ";
        }
	}

	if(!$boolNoSQLInjection) {
		echo generateCustomErrorString("-303","Failed to Process Query. SQL Injection Detected. Please contact your Administrator.");
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

	//Build SQL to get service details from sc_folio and config_itemi
	
	$strCols = "SELECT 	sc_typei.type_display,
							ck_config_item,
							cmdb_status,
							config_itemi.pk_auto_id,
							fk_cmdb_id,
							config_itemi.flg_allow_support,
							config_itemi.flg_allow_request,
							fk_status_level,
							vsb_image,
							vsb_title,
							vsb_description,
							vsb_key_features,
							sc_folio.vsb_icon,
							sc_folio.fk_df_onsub,
							sc_folio.fk_df_onreq,
							sc_folio.fk_df_support,
							sc_subscription.pk_id  AS subs_id ";

	$strFromTable = " FROM config_itemi, sc_folio, sc_typei, sc_subscription ";
	$strWhere = "	sc_typei.pk_config_type = config_itemi.catalog_type
								AND config_itemi.pk_auto_id = sc_subscription.fk_service
								AND sc_folio.fk_cmdb_id = config_itemi.pk_auto_id
								AND config_itemi.pk_auto_id in (".$serviceKeys.")
								AND (config_itemi.flg_invisible_public IS NULL OR config_itemi.flg_invisible_public=0)
								AND (service_archived IS NULL OR service_archived != 1)
								AND config_itemi.status_portfolio = 'Catalog' ";
	$strWhere .= $strDynFilter;
	$strWhere .= $strFavServices;
	$strWhere .= $strCatFilter;
	
	
	$strOrderBy = " ORDER BY vsb_title ASC ";
	
	//-- remove duplicate service subscriptions
	if($session->msSqlInUse)
	{
		$strCols = "(" . $strCols . ", ROW_NUMBER() OVER (PARTITION BY pk_auto_id ORDER BY pk_auto_id) AS partitionOrder ";
		$strWhere .= ") AS tbl WHERE partitionOrder=1 ";
		$_POST['PartitionedList'] = true;
	}
	else
	{
		$strWhere .= " GROUP BY pk_auto_id ";
	}

	//Execute SQL
	$sqlDatabase = "swdata";
	$strPagedQuery = sql_page($strWhere, $intPageNo, $strCols, $strFromTable, $strOrderBy, $intNumRecords);
	$sqlCommand = $strPagedQuery;
    error_log($sqlCommand);