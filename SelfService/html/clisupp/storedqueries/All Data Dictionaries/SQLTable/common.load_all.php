<?php

	//-- will load sql table control using pk_auto_id in () and supprots optional passed in filter


	if($_POST['empty']=="1")
	{
		//-- return empty recordset
		throwSuccess(0);
	}


	$sqlDatabase = swfc_source();
	$sqlCommand = swfc_selectcolumns() . swfc_fromtable();
	$sqlCommand .= swfc_orderby();
?>