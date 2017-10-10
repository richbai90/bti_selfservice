<?php
set_time_limit(60);
//
include("stdinclude.php");
swphpGlobaliseRequestVars();

// Page ID for the navigation
if ($srid) $PAGEID = "RI";
else $PAGEID = "FR";

# Which survey are we examining. Hard coded for now but ultimately dynamic.
if (!$surveyid)
{
  echo "No such survey!";
  exit;
}

if(!swCreateSessionFromID($sessid))
{
	header("Location: error.php?error=11");
	exit;
}

$query = "SELECT cfg.surveyname,  
		  r.custname, 
		  r.callref, 
		  q.pqid, 
		  q.qtext, 
		  q.type, 
		  ra.srid,
		  ra.qid, 
		  ra.value
		  FROM survey_config cfg
		  JOIN survey_r r on cfg.surveyid = r.sid
		  JOIN survey_ra ra on r.srid = ra.srid
		  JOIN survey_q q on ra.qid = q.qid AND q.sid = ra.sid
		  WHERE  cfg.surveyid = '$surveyid'
		  AND r.cpltdate < DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 30 day)";
		  if($srid) $query .= " AND ra.srid = '$srid'";
		  $query .= " ORDER BY r.callref, q.qid";
		  
		  
		  //$res = new swphpDatabaseQuery($query, 'sw_systemdb');
		  
error_log('query began');
$result = new swphpDatabaseQuery($query,'sw_systemdb');
var_dump($result);
exit;
$rows = null;
//$surveyConfig = $result->fetch();
if (isset($result->response->data->rowData->row) && count($result->response->data->rowData->row))
{
	$rows = $result->response->data->rowData->row;
	$rep_tit = $rows[0]->surveyname;
}
else 
{
	header("Location: error.php?error=5");
	exit;
}
	
$indent = '';
$matrix = '';
$html = '';

function html($res, $i = 0, $html = '') {
	$next_card = false;
	$parent = 0;
	$callref = $res[$i]->callref;
	$html .= '<div class="card mt-3">';
	$html .= '<div class="card-block"><h4 class="card-title">'.$res[$i]->custname.'</h4>';
	$html .= '<h6 class="card-subtitle mb-2 text-muted">'.swcallref_str($callref).'</h6>';
	$html .= '</div>';
	$html .= '<ul class="list-group list-group-flush">';
	for(; $i < count($res); $i++) {
		$row = $res[$i];
		
		if($callref != $row->callref) {
			$next_card = true;
			break;
		}
		
		$next_row = $res[$i + 1];
		
		if($parent > 0 && $row->pqid != $parent) {
			$html .= '</ul></li>';
		}
		
		if($next_row->pqid == $row->qid) {
			$parent = $row->qid;
			$html .= '<li class="list-group-item"><strong>'.$row->qtext.'</strong>';
			$html .= '<ul class="list-group">';
			continue;
		}
		
		$html .= '<li class="list-group-item"><div class="row"><div class="col">'.$row->qtext.'</div><div class="col">'.$row->value.'</li>';
		
	}
	
	$html .= '</ul></div>';
	if($next_card) $html = html($res, $i, $html);
	return $html;
}

$html = html($rows);
$nav = '<img src="images/space.gif" width="15" height="2" alt="" border="0">';
if ($PAGEID == "LR") $nav .= '<li><a href="#" class="selected">List Respondents</a></li>';
else $nav .= '<li><a href="svy_rpt_respondent.php?sessid='.$sessid.'&surveyid='.$surveyid.'">List Respondents</a></li>';
if ($PAGEID == "GR") $nav .= '<li><a href="#" class="selected">Graphical Report</a></li>';
else $nav .= '<li><a href="svy_rpt_graphical.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Graphical Report</a></li>';
if ($PAGEID == "TR") $nav .= '<li><a href="#" class="selected">Textual Report</a></li>';
else $nav .= '<li><a href="svy_rpt_textual.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Textual Report</a></li>';
if ($PAGEID == "FT") $nav .= '<li><a href="#" class="selected">Comment Report</a></li>';
else $nav .= '<li><a href="svy_rpt_freetext.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Comment Report</a></li>';
if ($PAGEID == "FR") $nav .= '<li><a href="#" class="selected">Full Report</a></li><ul><li><a href="Javascript:window.document.surveyxls.submit();">Export to Excel</a></li></ul>';
else $nav .= '<li><a href="svy_rpt_full.php?sessid='.$sessid.'&surveyid='.$surveyid.'">Full Report</a></li>';

$_WSSM_HEADER_LOGO="img/header/Supportworks_Customer_Survey.png";
if (file_exists("customisation/override.php")) include("customisation/override.php"); //-- any overriding image paths (for logos)
?>

<html>
<head>
	<title>Survey Reports</title>
	<link href="styles/mainstyles.php" rel="stylesheet" type="text/css">
	<link href="css/structure_ss.css" rel="stylesheet" type="text/css" />	
	<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
	<link href="customisation/css/override.css" rel="stylesheet" type="text/css" />
</head>
<body>
<form name='surveyxls' method="post" action="svy_export.php" target="_blank">
<div id="pageArea">
<div id="topBanner">
		<div id="logoContainer"><span id="enterpriseLogo"><img src="<?php echo $_WSSM_HEADER_LOGO;?>" id="logoImage" alt="" border="0" /></span></div>
		<div id="helpbox">
				<table height="63">
					<tr><td align="right" valign="bottom" class="title">
								<?php echo  htmlentities($rep_tit); ?>
						</td>
					</tr>
				</table>
			</div>
	</div>

	<!-- LEFT MENU AREA -->
		<div id="navColumn">
			<?php
				echo "<ul id='ul_menulist'>";
				echo $nav;
				echo "</ul>";
			?>
		</div>

	<div style="margin-left:220px;">
		
			<input type='hidden' name='surveyid' value="<?php echo $surveyid;?>">
			<input type='hidden' name='filename' value='survey_results.xls'>	
		
		<br>
		<div class="header">Full Report</div>
		
        <div class="container">
		  <?php echo $html?>
		</div>
	</div>
</div>
</form>
</body>
</html>



