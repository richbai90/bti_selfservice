<?php

	//-- loop passed in columns for table and create insert statement
	//-- 
	IncludeApplicationPhpFile("service.helpers.php");
	IncludeApplicationPhpFile("itsm.helpers.php");
	$service = new serviceFunctions();
	if($service->can_update())
	{
		$serviceKey = PrepareForSql($_POST['sc_key']);
		$service_name = PrepareForSql($_POST['sc_name']);
		$arrData = Array();
		$arrData['fk_service_id'] = $serviceKey;
		$arrData['fk_service_name'] = $service_name;
        $arc = xmlmc_updateRecord('custom_standard_services',$arrData);
		($arc === 1) ? throwSuccess() : throwProcessErrorWithMsg('There was a problem inserting into custom_statndard_services. Please see the logs for details');
	}
	else
	{
		throwProcessErrorWithMsg("You are not authorised to update services. Please contact your Administrator.");
		exit(0);
	}
?>