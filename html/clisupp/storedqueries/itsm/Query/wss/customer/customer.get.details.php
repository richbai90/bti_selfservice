<?php
IncludeApplicationPhpFile("itsm.helpers.php");
$strWssCustId = pfs(strtolower(trim($_POST['custid'])));
$strSQL  = "SELECT * FROM userdb WHERE keysearch = '$strWssCustId'";
$sqlDatabase = "swdata";
$sqlCommand = $strSQL;