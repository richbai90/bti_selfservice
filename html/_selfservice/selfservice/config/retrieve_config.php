<?php
  $jsonString = file_get_contents('_ssp_config.json');
  header('Content-type: application/json');
  echo $jsonString;
