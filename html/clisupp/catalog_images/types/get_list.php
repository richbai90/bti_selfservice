<?php
	//-- NWJ - 05.06.2007
	//-- Return xml list for fat client xml listbox

	//-- showing images from vmcimages dir
	//-- F0097543
	$VCMPATH = "&amp;[app.webroot]/clisupp/catalog_images/types/";
	$d = dir(".");
	echo "<list>";
	while (false !== ($entry = $d->read())) 
	{
		if (is_file($entry) && strpos($entry,".php")===false)
		{
			$value = $VCMPATH . rawurlencode($entry);
		  echo "<item value='".$value."'>".$entry."</item>";
		}
	}
	echo "</list>";
	$d->close();

?>
