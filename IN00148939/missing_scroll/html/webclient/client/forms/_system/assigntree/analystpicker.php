<?php

	//--
	//-- nwj - load helpdesk xml definition file and create outlook control 
	$excludeTokenCheck=true;
	include('../../../../php/session.php');

?>
<html>
<title><?php echo $_REQUEST['formtitle'];?></title>
<head>
	<link rel="StyleSheet" href="tree.css" type="text/css" />
	<style>
		body
		{
			background-color:#dfdfdf;
		}

		.analysttree
		{
			background-color:#ffffff;
			border:1px solid #808080;
			padding:3px;

		}
	</style>
</head>
<script>
	var undefined;
	if(window.dialogArguments!=undefined)
	{
		var info = window.dialogArguments;
	}
	else
	{
		var info = opener.__open_windows[window.name];
	}	
	var app = info.__app;
	var jqDoc = app.jqueryify(document); //-- so can use jquery	

	if(info.__params==undefined)info.__params="";
	info.__params = info.__params + "";
	var arrParams = info.__params.split("&");
	for(var x=0;x<arrParams.length;x++)
	{
		//-- store param and decode value as may have url encoded (esp if it has &amp)
		var iPos = arrParams[x].indexOf("=");
		var paramName = app.trim(arrParams[x].substring(0,iPos));
		var paramValue = arrParams[x].substring(iPos+1);
		try
		{
			document[paramName.toLowerCase()] = decodeURIComponent(paramValue); 
		}
		catch(e)
		{
			document[paramName.toLowerCase()] = paramValue; 
		}
	}

	document.title = document["formtitle"];



	function rf()
	{
		return false;
	}


	var o = new Object();
	o.groupid = "";
	o.analystid = "";
	o.groupname = "";
	o.analystname = "";
	o.thirdparty = "";
	function select_analyst()
	{
		//-- pass back info to calling function
		//-- get selected node
		var selNode = d.getSelectedNode();
		if(selNode==undefined)
		{
			alert("Please select an analyst or support group.");
			return;
		}
		if(selNode.pid==d.root.id)
		{
			//-- has selected top level so return ""
				var strGroupID = "";
				var strGroupName = "";
				var strAnalystID ="";
				var strAnalystName ="";

		}
		else
		{
			//-- nwj - 90893 - test if just group by using swgroupid (before we were checking to see if had children - so groups without children were being treated as nodes)
			if(selNode.swgroupid)
			{

				//-- a suppgroup
				var strGroupID = selNode.swgroupid;
				var strGroupName = d.getNodeTextPath();
				var strAnalystID ="";
				var strAnalystName ="";
			}
			else
			{
				var parenNode = d.getSelectedNodeParent();
				var strGroupID = parenNode.swgroupid;
				var strGroupName = d.getNodeTextPath("->",parenNode);
				var strAnalystID =selNode.id;
				var strAnalystName =selNode.name;
			}
		}

		//-- get third party contract if selected
		var topNode = null;
		var pNode= selNode;
		while(pNode!=null)
		{
			if(pNode.pid==-1)
			{
				topNode = pNode;
				break;
			}
			pNode= selNode.tree.getNodeByID(pNode.pid);
			if(pNode!=null) topNode = pNode;
		}

		var thirdPartyContract = "";
		
		if(topNode.id=="_THIRDPARTY")
		{
			if(isNaN(selNode.id))
			{
				alert("Please select a third party contract in order to assign it to the third party");
			}
			else
			{
				o.groupid = "_THIRDPARTY";
				o.analystid = parenNode.id;
				o.groupname = "_THIRDPARTY";
				o.analystname = parenNode.name;
				o.thirdparty = selNode.name;
			}
		}
		else
		{

			o.groupid = strGroupID;
			o.analystid = strAnalystID;
			o.groupname = strGroupName;
			o.analystname = strAnalystName;
			o.thirdparty = "";
		}

		self.close();
	}

	function form_close()
	{
		app.__open_windows[window.name].returnInfo = o;
		d = null;
	}
</script>
<body onbeforeunload="form_close();"  onunload="app._on_window_closed(window.name)">
<div class="wrapper">
    <div class="analysttree">
        <div class="dtree">
            <script type="text/javascript">


                d = app.newtree('d',document);
                d.config.folderLinks = true; //-- folder behave link nodes when clicked
                d.config.useCookies = false;

                //-- output assignment tree control

                //-- create helpdesk root element
                var strRootTxt = app.dd.GetGlobalParamAsString("views/helpdesk view/team view/name");
                if(strRootTxt == "")strRootTxt = "Supportworks Helpdesk";
                var strRootImage = "treeimages/helpdesk/servicedesk.png";
                var strRootOpenImage = "treeimages/helpdesk/servicedesk.png";
                d.add("swhd",-1,"<b>"+strRootTxt+"</b>",rf,strRootTxt,"",strRootImage,strRootOpenImage,true);


                //-- process groups
                var strGroupImage = "treeimages/helpdesk/suppgroup.png";
                var strGroupOpenImage = "treeimages/helpdesk/suppgroup.png";
                var arrGroupData = app._xml_helpdesk_assign_tree.getElementsByTagName("group");
                var arrGroupData = arrGroupData[0].getElementsByTagName("group");
                for(var x=0;x<arrGroupData.length;x++)
                {
                    var xmlGroup = arrGroupData[x];

                    //-- determine parent id
                    var parentNode = xmlGroup.parentNode;
                    if(parentNode.tagName.toLowerCase()!="group")
                    {
                        //-- top level group
                        var strParentID = "swhd";
                    }
                    else
                    {
                        //-- we are a child group to get parent id
                        var strParentID = app.xmlNodeTextByTag(parentNode,"id");
                        if(strParentID=="/")
                        {
                            strParentID="swhd";
                        }
                        else
                        {
                            strParentID = "grp_" + strParentID;
                        }
                    }

                    //-- add the group
                    var strGroupKey = app.xmlNodeTextByTag(xmlGroup,"id");
                    var strGroupTxt = app.xmlNodeTextByTag(xmlGroup,"name");
                    var aN = d.add("grp_"+strGroupKey,strParentID,"<b>"+strGroupTxt+"</b>",rf,strGroupTxt,"",strGroupImage,strGroupOpenImage,false);
                    aN.swgroupid = strGroupKey;
                    aN.ondblclick = select_analyst;
                }

                //-- process analysts
                var strAnalystImage = "treeimages/helpdesk/swanalyst.png";
                var strAnalystOpenImage = "treeimages/helpdesk/swanalyst.png";
                var arrAnalystData = app._xml_helpdesk_assign_tree.getElementsByTagName("analyst");
                for(var x=0;x<arrAnalystData.length;x++)
                {
                    var xmlAnalyst = arrAnalystData[x];

                    //-- determine parent id
                    var parentNode = xmlAnalyst.parentNode;
                    if(parentNode.tagName.toLowerCase()!="group")
                    {
                        //-- top level analysts
                        var strParentID = "swhd";
                    }
                    else
                    {
                        //-- we are a child group to get parent id
                        var strParentID = app.xmlNodeTextByTag(parentNode,"id");
                    }


                    //-- add the analyst
                    var strAnalystKey = app.xmlNodeTextByTag(xmlAnalyst,"id");
                    var strAnalystTxt = app.xmlNodeTextByTag(xmlAnalyst,"name");
                    var aNode = d.add(strAnalystKey,"grp_"+strParentID,strAnalystTxt,rf,strAnalystTxt,"",strAnalystImage,strAnalystOpenImage,false,true);
                    aN.swgroupid = strParentID;
                    aNode.ondblclick = select_analyst;
                }


                if(app._xml_helpdesk_3p_assign_tree!=null && document["showthirdparty"]!="false")
                {
                    //-- process 3rd party - if enabled
                    var strRootTxt = "3rd Party Suppliers";
                    var strRootImage = "treeimages/helpdesk/servicedesk.png";
                    var strRootOpenImage = "treeimages/helpdesk/servicedesk.png";
                    d.add("_THIRDPARTY",-1,"<b>"+strRootTxt+"</b>",rf,strRootTxt,"",strRootImage,strRootOpenImage,true);

                    //-- process 3p
                    var strGroupImage = "";
                    var strGroupOpenImage = "";
                    var arrGroupData = app._xml_helpdesk_3p_assign_tree.getElementsByTagName("contract");
                    for(var x=0;x<arrGroupData.length;x++)
                    {
                        var xmlGroup = arrGroupData[x];

                        //-- determine parent id
                        var parentNode = xmlGroup.parentNode;
                        if(parentNode.tagName.toLowerCase()!="contract")
                        {
                            //-- top level group
                            var strParentID = "_THIRDPARTY";
                        }
                        else
                        {
                            //-- we are a child group to get parent id
                            var strParentID = app.xmlNodeTextByTag(parentNode,"id");
                        }

                        //-- add the group
                        var strGroupKey = app.xmlNodeTextByTag(xmlGroup,"id");
                        var strGroupTxt = app.xmlNodeTextByTag(xmlGroup,"name");
                        var aNode = d.add(strGroupKey,strParentID,"<b>"+strGroupTxt+"</b>",rf,strGroupTxt,"",strGroupImage,strGroupOpenImage,false);
                        aNode.ondblclick = select_analyst;
                    }

                    //-- process analysts
                    var strAnalystImage = "";
                    var strAnalystOpenImage = "";
                    var arrAnalystData = app._xml_helpdesk_3p_assign_tree.getElementsByTagName("sla");
                    for(var x=0;x<arrAnalystData.length;x++)
                    {
                        var xmlAnalyst = arrAnalystData[x];

                        //-- determine parent id
                        var parentNode = xmlAnalyst.parentNode;
                        if(parentNode.tagName.toLowerCase()!="contract")
                        {
                            //-- top level analysts
                            var strParentID = "_THIRDPARTY";
                        }
                        else
                        {
                            //-- we are a child group to get parent id
                            var strParentID = app.xmlNodeTextByTag(parentNode,"id");
                        }

                        //-- add the analyst
                        var strAnalystKey = app.xmlNodeTextByTag(xmlAnalyst,"id");
                        var strAnalystTxt = app.xmlNodeTextByTag(xmlAnalyst,"name");

                        var aNode = d.add(strAnalystKey,strParentID,strAnalystTxt,rf,strAnalystTxt,"",strAnalystImage,strAnalystOpenImage,false,true);
                        aNode.ondblclick = select_analyst;
                    }
                }


                document.write(d);

                //-- open to logged in analyst

                var pos = d.getNodePositionByID(app._analyst_id,"grp_" + app._analyst_supportgroup);
                if(pos>-1)d.openTo(pos,true,true,true);
            </script>
        </div>
    </div>
    <div><button onclick="select_analyst();">Select</button>&nbsp;&nbsp;<button  onclick="self.close();">Cancel</button></div>
</div>
</body>
</html>
