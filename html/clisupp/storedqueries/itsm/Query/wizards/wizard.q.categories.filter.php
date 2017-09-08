<?php
include_once('SwPhpDll.php');

$installPath = sw_getcfgstring("InstallPath");

$dd = json_decode(file_get_contents($installPath . '/data/_dd_data/exported/itsm/xml/globalParams/Global Parameters.json'));

$folders = $dd->espGlobalParameters->folder;
$pc_filter = '';
foreach ($folders as $folder) {
    if ($folder->name === 'DD Filters') {
        $params = $folder->params;
        foreach ($params as $param) {
            if (strtolower($param->name) === 'wsspcfilter') {

                $pc_filter = method_exists($param, 'value') ? $param->value : '';
                break;
            }
        }

        break;
    }
}

if($pc_filter && $pc_filter != '') $pc_filter = 'WHERE ' . $pc_filter;

$sqlCommand = "SELECT code FROM pcinfo $pc_filter";
