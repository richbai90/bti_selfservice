<?php


if($bLoggedOut)
{
	$srcPath = "";
}
else
{
	$srcPath = "../";
}


?>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<title>Supportworks Webclient Version 1.2.0</title>
<style>
	*
	{
		font-size:100%;font-family:Verdana,sans-serif;letter-spacing:.03em;
	}

	body
	{
		overflow:hidden;
		height: 100%;
		margin: 0;
		padding: 0;
	}

	img#bg 
	{
		position:absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;
		z-index:-1;
	}

	td
	{
		font-size:82%;
	}

	a
	{
		text-decoration:none;
		color:#08D;
	}

	a:hover
	{
		text-decoration:underline;
		color:#08D;
	}

	.tb-long
	{
		width:200px;
		height:24px;
		font-size:14px;
	}

	.cb
	{
		margin-left:-4px;
	}
	
	.cb-label
	{
		position:relative;
		top:-2px;
	}

	.btn-small
	{
		background-color:#D6E7FB;
		border-color:#4A95C9;
		border-width:1px;
		border-style:solid;
	}

	.error-message
	{
		color:red;
	}

	#div_rememberme
	{
		border-style:solid;
		border-width:0px 0px 0px 1px;
		border-color:#B4B4B4;
		width:100%;
		height:100%;
	}

</style>

<!--[if gte IE 5.5]>
<![if lt IE 7]>
	<style type="text/css">
		#sp_logo img { filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0); }
		#sp_logo { display: inline-block; }
		#sp_logo { filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='client/images/supportworks_esp_long.png'); }

	</style>
<![endif]>
<![endif]-->

<script src="<?php echo $srcPath;?>client/js/min/app.browser.js"></script>
<script src="<?php echo $srcPath;?>client/js/min/app.dhtml.js"></script>
<script src="<?php echo $srcPath;?>client/js/min/app.xmlhttp.js"></script>
<script>
	var isIE  = (BrowserDetect.browser=="Internet Explorer")?true:false;
	var isSafari  = (BrowserDetect.browser=="Safari")?true:false;
	var isFirefox  = (BrowserDetect.browser=="Firefox")?true:false;	
	var isOpera  = (BrowserDetect.browser=="Opera")?true:false;		
	var _swsessionid="";
	var bProcessing=false;
	function _focus_login()
	{
		var e = document.getElementById("tb_userid");
		if(e!=null)e.focus();
	}
</script>
<body onload="_focus_login()">
<img src='<?php echo $srcPath;?>client/images/loginblue.jpg' alt="background image" id="bg" />
<span id='sp_logo' style='position:absolute;top:30px;left:20px;'><img id='ing_logo' src='<?php echo $srcPath;?>client/images/supportworks_esp_long.png' width='294px' height='54px'/></span>
<table width='100%' height='100%'>
<tr>
	<td>
		<center><?php echo $trustedlogonmessage;?></center>
	</td>
</tr>
</table>
</body>
</html>