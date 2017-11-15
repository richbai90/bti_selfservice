<?php
IncludeApplicationPhpFile("itsm.helpers.php");
$strWssCustId = pfs(strtolower(trim($_POST['custid'])));
$strSQL  = "SELECT keysearch, fullname FROM userdb WHERE keysearch like '%$strWssCustId%' OR fullname like '%$strWssCustId%'";
$sqlDatabase = "swdata";
$sqlCommand = $strSQL;