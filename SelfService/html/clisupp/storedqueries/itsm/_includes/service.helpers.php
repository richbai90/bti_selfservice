<?php

//-- service class and instance - put any custom helper functions for itsm services in here
//-- that way will not conflict with php processor functions. Any common functions can define here and at later date can add to php processor

if(!clasS_exists('serviceFunctions'))
{
	define('SERVICE_ERROR','-103');

	//-- CMDB group & items
	define('PG_SC','H');
	define('SC_VIEW',1);
	define('SC_EDIT',2);
	define('SC_ADD',3);
	define('SC_DELETE',4);
	define('SC_COST_SUBSCRIPTION',5);
	define('SC_DEMAND',7);
	define('SC_BASELINES',8);
	define('SC_PIPELINE', 9);
	define('SC_RETIRED', 9);

	class serviceFunctions
	{
		function throwError($msg)
		{
			throwError(SERVICE_ERROR,$msg);
		}

		function can_view($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_VIEW);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view services.");
			}
			//-- user can
			return $boolCan;
		}

		function can_create($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_ADD);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to create services.");
			}
			//-- user can
			return $boolCan;
		}


		function can_delete($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_DELETE);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to delete services.");
			}
			//-- user can
			return $boolCan;
		}

		function can_update($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_EDIT);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to update services.");
			}
			//-- user can
			return $boolCan;
		}

		function can_manage_cost_and_subs($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_COST_SUBSCRIPTION);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view the services financial information.");
			}
			//-- user can
			return $boolCan;
		}

		function can_manage_demand_model($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_DEMAND);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view the services demand modellin");
			}
			//-- user can
			return $boolCan;
		}

		function can_manage_baselines($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_BASELINES);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view the services baselines.");
			}
			//-- user can
			return $boolCan;
		}

		function can_manage_pipeline($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_PIPELINE);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view the pipeline services.");
			}
			//-- user can
			return $boolCan;
		}

		function can_manage_retired($boolMSG=false)
		{
			//-- user can view
			$boolCan = HaveAppRight(PG_SC, SC_RETIRED);
			if(($boolMSG)&&(!$boolCan))
			{
				$this->throwError("You are not authorised to view the retired services.");
			}
			//-- user can
			return $boolCan;
		}

		//-- Create array of all values from $strKeyColumn returned by $strSQL
		function create_key_array($strSQL,$strKeyColumn)
		{
			$aRS = get_recordset($strSQL,"swdata");
			$intKeyIndex = 0;
			while($aRS->Fetch())
			{
				$aKeys[$intKeyIndex]  = get_field($aRS,$strKeyColumn);
				$intKeyIndex++;
			}
			return $aKeys;
		}

		//-- Delete records with primary key in $arrKeys from $strTable
		function xmlmc_deleteRecords($arrKeys, $strTable)
		{
			foreach ($arrKeys as $key)
			{
				$arc = xmlmc_deleteRecord($strTable,$key);
				if(1==$arc)
				{
					return 1;
				}
				else
				{
					return 0;
				}
			}
		}

		// -- Get key column value and call deleteRecord
		function xmlmc_deleteRecord_where($strTable,$strWhere,$sqlDatabase="swdata",$skip=false)
		{
			$strTableName = UC($strTable);
			$strTableKey = UC(getTablePrimaryKeyName($strTableName,$sqlDatabase));
			$strSelect = "SELECT ".$strTableKey." FROM ".$strTableName." WHERE ".$strWhere;
			$oRS = get_recordset($strSelect,$sqlDatabase);
			$arrIDs = array();
			while($oRS->Fetch())
			{
				$arrIDs[] = get_field($oRS,$strTableKey);
			}
			if(count($arrIDs)>0)
			{
				foreach($arrIDs as $key)
				{
					$arc = xmlmc_deleteRecord($strTableName,$key);
					if(1==$arc) continue;
					else throwError(100,$arc);
				}

			}
			if(!$skip) throwSuccess();

		}

		function delete_serviceitem($strItems,$boolDeleteBaselines)
		{
			if(!$this->can_delete(true)) return -1;

			$bProcessOK = 1;
			$strItems = pfs($strItems);


			$strKeyValue = $strItems;

			//-- for each item delete relations from opencall records, delete diary, ci relations and baselines if selected

			//-- Create array of CI keys for deletion (via xml_deleteRecord)
			$strCIsSQL = "SELECT PK_AUTO_ID FROM CONFIG_ITEMI WHERE PK_AUTO_ID in(" . $strItems . ")";
			$aCIsKeys = $this->create_key_array($strCIsSQL,"PK_AUTO_ID");

			$strDeleteOCs = "delete from CMN_REL_OPENCALL_CI where FK_CI_AUTO_ID in(" . $strItems . ")";

			//-- Create array of relation keys for deletion (via xml_deleteRecord)
			$strRelsSQL = "SELECT PK_AUTO_ID FROM CONFIG_RELI WHERE FK_CHILD_ID in(" . $strItems . ") or FK_PARENT_ID in(" . $strItems . ")";
			$aRelsKeys = $this->create_key_array($strRelsSQL,"PK_AUTO_ID");

			//-- Create array of diary keys for deletion (via xml_deleteRecord)
			$strDEsSQL = "SELECT PK_AUTO_ID FROM CONFIG_DIARY WHERE FK_CI_ID in (" . $strItems . ")";
			$aDEsKeys = $this->create_key_array($strDEsSQL,"PK_AUTO_ID");

			//-- Create array of history keys for deletion (via xml_deleteRecord)
			$strHisSQL = "SELECT PK_AUTO_ID FROM CI_AVAIL_HIST WHERE FK_CI_ID in (" . $strItems . ")";
			$aHisKeys = $this->create_key_array($strHisSQL,"PK_AUTO_ID");

			//-- Create array of profile keys for deletion (via xml_deleteRecord)
			$strProfSQL = "SELECT PK_AUTO_ID FROM CT_PROFILES WHERE FK_CONFIG_ITEM in (" . $strItems . ")";
			$aProfKeys = $this->create_key_array($strProfSQL,"PK_AUTO_ID");

			$strSelectExtDetails = "select * from SC_FOLIO where FK_CMDB_ID in (" . $strItems . ")";
			if($boolDeleteBaselines)
			{
				$dfIDs = "";
				$oRS = get_recordset($strSelectExtDetails,"swdata");
				while($oRS->Fetch())
				{
					if($dfIDs!="")$dfIDs.=",";
					$dfIDs .= get_field($oRS,"FK_DF_SUPPORT").",".get_field($oRS,"FK_DF_ONREQ").",".get_field($oRS,"FK_DF_ONSUB");
				}
				if($dfIDs=="")$dfIDs="-1";
			}

			$strSelectRels = "select * from SC_RELS where FK_SERVICE in (" . $strItems . ")";
			$relIDs = "";
			$oRS = get_recordset($strSelectRels,"swdata");
			while($oRS->Fetch())
			{
				if($relIDs!="")$relIDs.=",";
				$relIDs .= get_field($oRS,"PK_AUTO_ID");
			}
			if($relIDs=="")$relIDs="-1";

			//-- Create array of rel keys for deletion (via xml_deleteRecord)
			$strSelectRels2 = "select PK_AUTO_ID from SC_RELS where FK_SERVICE_RELS in (" . $relIDs . ") or PK_AUTO_ID in (".$relIDs.")";
			$aRel2Keys = $this->create_key_array($strSelectRels2,"PK_AUTO_ID");

			$strSelectSubscriptions = "select * from SC_SUBSCRIPTION where FK_SERVICE in (" . $strItems . ")";
			$subscriptionIDs = "";
			$oRS = get_recordset($strSelectSubscriptions,"swdata");
			while($oRS->Fetch())
			{
				if($subscriptionIDs!="")$subscriptionIDs.=",";
				$subscriptionIDs .= get_field($oRS,"PK_ID");
			}
			if($subscriptionIDs=="")$subscriptionIDs="-1";

			//-- Create array of SLA rel keys for deletion (via xml_deleteRecord)
			$strSelectSlaRels = "select PK_AUTO_ID from SC_SLA where FK_SUBSCRIPTION in (" . $subscriptionIDs . ") or FK_SERVICE in (".$strItems.")";
			$aSlaRelsKeys = $this->create_key_array($strSelectSlaRels,"PK_AUTO_ID");

			//-- Create array of subscription keys for deletion (via xml_deleteRecord)
			$strSelectSubKeys = "select PK_ID from SC_SUBSCRIPTION where PK_ID in (" . $subscriptionIDs . ")";
			$aSubKeys = $this->create_key_array($strSelectSubKeys,"PK_ID");

			//-- Create array of favourites keys for deletion (via xml_deleteRecord)
			$strSelectFavKeys = "select PK_FAV_ID from SC_FAVOURITES where FK_SERVICE_ID in (" . $strItems . ")";
			$aFavKeys = $this->create_key_array($strSelectFavKeys,"PK_FAV_ID");

			//-- Create array of service keys for deletion (via xml_deleteRecord)
			$strSelectServKeys = "select FK_CMDB_ID from SC_FOLIO where FK_CMDB_ID in (" . $strItems . ")";
			$aServKeys = $this->create_key_array($strSelectServKeys,"FK_CMDB_ID");

			if($boolDeleteBaselines)
			{
				//-- Create array of data from keys for deletion (via xml_deleteRecord)
				$strSelectDFKeys = "select PK_AUTO_ID from SC_DATAFORM where PK_AUTO_ID in (".$dfIDs.")";
				$aDFKeys = $this->create_key_array($strSelectDFKeys,"PK_AUTO_ID");
			}


			//-- Delete OC rels
			if(!submitsql($strDeleteOCs))$bProcessOK=0;

			//-- Delete Rels
			$bProcessOK = $this->xmlmc_deleteRecords($aRelsKeys,"CONFIG_RELI");

			//-- Delete diary enries
			$bProcessOK = $this->xmlmc_deleteRecords($aDEsKeys,"CONFIG_DIARY");

			//-- Delete history
			$bProcessOK = $this->xmlmc_deleteRecords($aHisKeys,"CI_AVAIL_HIST");

			//-- Delete profiles
			$bProcessOK = $this->xmlmc_deleteRecords($aProfKeys,"CT_PROFILES");

			//-- Delete rels
			$bProcessOK = $this->xmlmc_deleteRecords($aRel2Keys,"SC_RELS");

			//-- Delete SLA rels
			$bProcessOK = $this->xmlmc_deleteRecords($aSlaRelsKeys,"SC_SLA");

			//-- Delete subscriptions
			$bProcessOK = $this->xmlmc_deleteRecords($aSubKeys,"SC_SUBSCRIPTION");

			if($boolDeleteBaselines)
			{
				//-- Delete data forms
				$bProcessOK = $this->xmlmc_deleteRecords($aDFKeys,"SC_DATAFORM");
			}
			//-- Delete favourites
			$bProcessOK = $this->xmlmc_deleteRecords($aFavKeys,"SC_FAVOURITES");
			//-- Delete services
			$bProcessOK = $this->xmlmc_deleteRecords($aServKeys,"SC_FOLIO");

			//-- delete ci baselines so long as they are not active
			if($boolDeleteBaselines)
			{
				//-- for each ci get its baselineid and delete all those CI with the same one (only delete those that are older than one being deleted)
				$strDeleteBaselineKeys = "";
				$strSelectBaselines = "select BASELINEID from CONFIG_ITEMI where PK_AUTO_ID in (" . $strItems . ") and ISACTIVEBASELINE!='Yes'";
				$oRS = get_recordset($strSelectBaselines,"swdata");
				while($oRS->Fetch())
				{
					if ($strDeleteBaselineKeys!="")$strDeleteBaselineKeys .=",";
					$strDeleteBaselineKeys .= get_field($oRS,"BASELINEID");
				}

				//-- delete baselines
				if($strDeleteBaselineKeys!="")$this->delete_serviceitem($strDeleteBaselineKeys,false);
			}

			//-- Delete CIs
			$bProcessOK = $this->xmlmc_deleteRecords($aCIsKeys,"CONFIG_ITEMI");
			//-- lastly delete the actual ci record and return result
//			$strDeleteCIs = "delete from CONFIG_ITEMI where PK_AUTO_ID in(". $configItemKeys .")";
//			$rs->Query($strDeleteCIs,"swdata");
//			return $rs;

			return $bProcessOK;
		}


		function baseline_reactive($intCIkey,$newCIkey)
		{
			$strUpdate = "update SC_SUBSCRIPTION set FK_SERVICE = " . PrepareForSql($newCIkey) . " where FK_SERVICE =  " . PrepareForSql($intCIkey);
			submitsql($strUpdate);
			$strUpdate = "update SC_FAVOURITES set FK_SERVICE_ID = " . PrepareForSql($newCIkey) . " where FK_SERVICE_ID =  " . PrepareForSql($intCIkey);
			submitsql($strUpdate);
		}

		function baseline_create($intCIkey,$newCIkey)
		{

			$bProcessOK = true;

			//-- select diary entries for from ci
			//-- loop and do insert into diary for to ci
			$strSelect= "select * from SC_RELS where FK_SERVICE = " . pfs($intCIkey);
			$oRS = get_recordset($strSelect);

			while($oRS->Fetch())
			{
				//-- set new fields for copy record
				$strTable = 'SC_RELS';

				if($strTable)$dd = new dd($strTable); //-- load table col info so can use swjs style dd.tables
				$strCols = "";
				$strValues= "";
				$strPK = "";
				$tablePkCol = dd_primarykey($strTable);

				for ($x=0; $x < count($dd->tables[$strTable]->columns);$x++)
				{
					$colName = $dd->tables[$strTable]->columns[$x]->Name;
					$colValue = get_field($oRS,$colName);

					if (UC($colName) != UC($tablePkCol))
					{
						//-- check for iscurrentversion and bln
						if (UC($colName) == "FK_SERVICE") $colValue = $newCIkey;
						if(isColNumeric($tableName,$primaryKeyColumn) && $colValue=="")
						{
							$colValue = 0;
						}
						$arrData1[$colName] = $colValue;

					}
					else
					{
						$strPK = $colValue;
					}

				}
				//-- eof for ($x=0; $x < count($dd->tables[$strTable]->columns);$x++)
				$arc = xmlmc_addRecord($arrData1,$strTable);
				if(1==$arc)
				{
					$strSelect = "select max(PK_AUTO_ID) from SC_RELS where FK_SERVICE = " . $newCIkey;
					$onewRS = get_recordset($strSelect,"swdata");
					$newRelkey = 0;
					while($onewRS->Fetch())
					{
						$newRelkey = $onewRS->GetValueAsString(0);
					}

					$strSelect = "select * from SC_RELS where  FK_SERVICE_RELS =  " . $strPK;
					$osubRS = get_recordset($strSelect);
					while($osubRS->Fetch())
					{
						//-- set new fields for copy record
						$strCols	 = "";
						$strValues= "";
						for ($x=0; $x < count($dd->tables[$strTable]->columns);$x++)
						{
							$colName = $dd->tables[$strTable]->columns[$x]->Name;
							$colValue = get_field($osubRS,$colName);

							if (UC($colName) != UC($tablePkCol))
							{
								//-- check for iscurrentversion and bln
								if (UC($colName) == "FK_SERVICE_RELS") $colValue = $newRelkey;

								$arrData2[$colName] = $colValue;

							}
						}
						$arc = xmlmc_addRecord($arrData2,$strTable);
						if(1==$arc)
						{
							//-- Record inserted successfully
						}else
						{
							$bProcessOK=false;
						}


					}
				}//-- eof if (submitsql($strInsertSQL))
			}//-- eof while($oRS->Fetch())

			$strSelectSubKeys = "select PK_ID from SC_SUBSCRIPTION where FK_SERVICE =  " . $intCIkey;
			$aSubKeys = $this->create_key_array($strSelectSubKeys,"PK_AUTO_ID");
			foreach ($aSubKeys as $subKey)
			{
				$arrData3['PK_ID'] = $subKey;
				$arrData3['FK_SERVICE'] = $newCIkey;
				$arc = xmlmc_updateRecord($strTable,$arrData3);
				if(1==$arc)
				{
					//-- Record updated successfully
				}
				else
				{
					$bProcessOK=false;
				}
			}

			$strSelect = "select * from SC_SLA where FK_SERVICE = " . $intCIkey;
			$oRS = get_recordset($strSelect,"swdata");
			while($oRS->Fetch())
			{
				$arrData4['FK_SERVICE'] = $newCIkey;
				$arrData4['PRICE'] = pfs(get_field($oRS,"PRICE"));
				$arrData4['TOTAL_COST'] = pfs(get_field($oRS,"TOTAL_COST"));
				$arrData4['MARK_UP'] = pfs(get_field($oRS,"MARK_UP"));
				$arrData4['COST'] = pfs(get_field($oRS,"COST"));
				$arrData4['FK_SLA'] = pfs(get_field($oRS,"FK_SLA"));
				$arrData4['FK_SUBSCRIPTION'] = 0;
				$arrData4['FK_SLA_NAME'] = pfs(get_field($oRS,"FK_SLA_NAME"));
				$arc = xmlmc_addRecord("SC_SLA",$arrData4);
				if(1==$arc)
				{
					//-- Record updated successfully
				}
				else
				{
					$bProcessOK=false;
				}
			}

			$strSelectFavKeys = "select PK_FAV_ID from SC_FAVOURITES where FK_SERVICE_ID =  " . $intCIkey;
			$aFavKeys = $this->create_key_array($strSelectFavKeys,"PK_FAV_ID");
			foreach ($aFavKeys as $favKey)
			{
				$arrData5['PK_FAV_ID'] = $favKey;
				$arrData5['FK_SERVICE_ID'] = $intCIkey;
				$arc = xmlmc_updateRecord("SC_FAVOURITES",$arrData5);
				if(1==$arc)
				{
					//-- Record updated successfully
				}
				else
				{
					$bProcessOK=false;
				}
			}

			$strSelect = "select * from SC_DETAILS where FK_SERVICE = " . $intCIkey;
			$oRS = get_recordset($strSelect,"swdata");
			while($oRS->Fetch())
			{
				$arrData6['FK_SERVICE'] = $newCIkey;
				$arrData6['AREA'] = pfs(get_field($oRS,"AREA"));
				$arrData6['DETAILS'] = pfs(get_field($oRS,"DETAILS"));
				$arc = xmlmc_addRecord("SC_DETAILS",$arrData6);
				if(1==$arc)
				{
					//-- Record updated successfully
				}
				else
				{
					$bProcessOK=false;
				}

			}
			return $bProcessOK;
		}

		function add_view_permission($strType, $fk_cmdb_id, $keys)
		{
			$bProcessOK = "";
			$strSQL = "select * from CONFIG_ITEMI where PK_AUTO_ID in (". pfs($keys) .")";
			$strExisting = "";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$fetchKey  = get_field($oRS,"PK_AUTO_ID");
				$fetchText = get_field($oRS,"CK_CONFIG_ITEM");
				$fetchType = get_field($oRS,"CK_CONFIG_TYPE");
				$fetchDesc = get_field($oRS,"DESCRIPTION");
				$fetchTable =get_field($oRS,"ME_TABLE");

				$strSQL = "select * from SC_SUBSCRIPTION where FK_ME_KEY='" . pfs($fetchText) . "' and FK_ME_TABLE='" . pfs($fetchTable) . "' and FK_SERVICE = " . $fk_cmdb_id;
				$oExisting = get_recordset($strSQL,"swdata");
				if($oExisting->Fetch())
				{
					if($strExisting!="")$strExisting.="\n";
					$strExistin=$fetchDesc;
				}
				else
				{
					$strTable = "SC_SUBSCRIPTION";
					$arrData['FK_ME_KEY'] = pfs($fetchText);
					$arrData['FK_ME_TABLE'] = pfs($fetchTable);
					$arrData['TYPE'] = pfs($strType);
					$arrData['FK_ME_DISPLAY'] = pfs($fetchDesc);
					$arrData['FK_SERVICE'] = pfs($fk_cmdb_id);
					$arrData['REL_TYPE'] = "VIEW";
					$arrData['PERMIS_SEARCH'] = 1;
					$arrData['REQUEST_PRICE'] = "";
					$arrData['SUBSCRIPTION_PRICE'] = "";
					$arc = xmlmc_addRecord($strTable,$arrData);
					if(1==$arc)
					{
						//-- record added successfully
					}
					else
					{
						$bProcessOK=false;
					}


				}
			}

			if($strExisting!="")
			{
				return $strExisting;
			}

			return $bProcessOK;
		}

		function add_cmdb_component_custom($oComponentKey,$strCustomKeys)
		{
			$bProcessOK = true;

			$strSQL  = "select * from sc_rels where pk_auto_id = ".pfs($oComponentKey);
			$oRec  = get_recordset($strSQL);
			while ($oRec->Fetch())
			{
				$strParentCost =  get_field($oRec,"total_cost_for_item");
				if($strParentCost=="")$strParentCost="0";

				$strParentPrice =  get_field($oRec,"price");
				if($strParentPrice=="")$strParentPrice="0";
				$strParentApplyType =  get_field($oRec,"apply_type");
			}

			$arrKeys = explode(",",$strCustomKeys);
			for($i = 0 ; $i<count($arrKeys);  $i++)
			{
				$strSQL  = "select * from config_typei where pk_config_type = '".pfs($arrKeys[$i])."'";
				$oRec  = get_recordset($strSQL);
				if ($oRec->Fetch())
				{
					$description =  get_field($oRec,"type_display");
					$service_id =  get_field($oRec,"pk_config_type");

					$strCost = get_field($oRec,"bus_cost");
					if($strCost=="")$strCost="0";

					$strPrice = get_field($oRec,"bus_price");
					if($strPrice=="")$strPrice="0";

					$strDiff = format_float_to_decimal_str(parseFloat($strCost)-parseFloat($strParentCost));
					$strPriceDiff = format_float_to_decimal_str(parseFloat($strPrice)-parseFloat($strParentPrice));

					$arrData['FK_SERVICE_RELS'] = $oComponentKey;
					$arrData['SERVICE_ID'] = pfs($service_id);
					$arrData['DESCRIPTION'] = pfs($description);
					$arrData['FLG_INCLUDE'] = 1;
					$arrData['APPLY_TYPE'] = pfs($strParentApplyType);
					$arrData['COST_TYPE'] = "Component";
					$arrData['FLG_CANCUSTOMISE'] = "0";
					$arrData['UNITS'] = "1";
					$arrData['TOTAL_COST'] = get_field($oRec,"bus_cost");
					$arrData['TOTAL_UNIT_COST'] = get_field($oRec,"bus_cost");
					$arrData['CUSTOMISE_DIFF'] = $strDiff;
					$arrData['COST_WEIGHTING'] = "0";
					$arrData['TOTAL_COST_FOR_ITEM'] = get_field($oRec,"bus_cost");
					$arrData['PRICE_DIFF'] = $strPriceDiff;
					$arrData['PRICE'] = get_field($oRec,"bus_price");
					$arrData['GL_CODE'] = get_field($oRec,"gl_code");
					$strTable = "SC_RELS";
					$arc = xmlmc_addRecord($strTable,$arrData);
					if(1==$arc)
					{
						//-- Insert successful
					}
					else
					{
						$bProcessOK = false;
					}

				}

			}
			return $bProcessOK;
		}

		function add_component_custom($oComponentKey,$strCustomKeys)
		{
			$bProcessOK = true;

			$strSQL  = "SELECT * FROM SC_RELS WHERE PK_AUTO_ID = ".pfs($oComponentKey);
			$strDB = "swdata";
			$oRec  = get_recordset($strSQL);
			while ($oRec->Fetch())
			{
				$strParentCost =  get_field($oRec,"total_cost_for_item");
				if($strParentCost=="")$strParentCost="0";

				$strParentPrice =  get_field($oRec,"price");
				if($strParentPrice=="")$strParentPrice="0";
				$strParentApplyType =  get_field($oRec,"apply_type");
			}

			$arrKeys = explode(",",$strCustomKeys);
			for($i = 0 ; $i<count($arrKeys);  $i++)
			{
				$strSQL  = "SELECT * FROM SC_FOLIO WHERE FK_CMDB_ID = ".$arrKeys[$i];
				$oRec  = get_recordset($strSQL);
				while ($oRec->Fetch())
				{
					$description = get_field($oRec,"vsb_title");
					$service_id =  get_field($oRec,"service_name");

					$strCost = get_field($oRec,"cost_request");
					if($strCost=="")$strCost="0";

					$strPrice = get_field($oRec,"cost_request");
					if($strPrice=="")$strPrice="0";

					$strDiff = format_float_to_decimal_str(parseFloat($strCost)-parseFloat($strParentCost));
					$strPriceDiff = format_float_to_decimal_str(parseFloat($strPrice)-parseFloat($strParentPrice));

					$arrData['FK_SERVICE_RELS'] = $oComponentKey;
					$arrData['FK_KEY'] = $arrKeys[$i];
					$arrData['SERVICE_ID'] = pfs($service_id);
					$arrData['DESCRIPTION'] = pfs($description);
					$arrData['FLG_INCLUDE'] = 1;
					$arrData['APPLY_TYPE'] = pfs($strParentApplyType);
					$arrData['COST_TYPE'] = "Component";
					$arrData['FLG_CANCUSTOMISE'] = "0";
					$arrData['UNITS'] = "1";
					$arrData['TOTAL_COST'] = get_field($oRec,"total_cost");
					$arrData['TOTAL_UNIT_COST'] = get_field($oRec,"cost_request");
					$arrData['CUSTOMISE_DIFF'] = $strDiff;
					$arrData['COST_WEIGHTING'] = "0";
					$arrData['TOTAL_COST_FOR_ITEM'] = get_field($oRec,"cost_request");
					$arrData['PRICE_DIFF'] = $strPriceDiff;
					$arrData['PRICE'] = get_field($oRec,"cost_request");
					$arrData['GL_CODE'] = get_field($oRec,"fld_kw6");
					$strTable = "SC_RELS";


				}
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1==$arc)
				{
					//-- Insert successful
				}
				else
				{
					$bProcessOK = false;
				}
			}
			return $bProcessOK;

		}

		function add_cmdb_component($oServiceKey, $strComponentKey, $boolOptional=0)
		{
			$boolInclude = "1";
			if($boolOptional=="0")
			{
				$boolInclude = "0";
			}
			$strSQL  = "SELECT * FROM CONFIG_TYPEI WHERE PK_CONFIG_TYPE IN ('".pfs($strComponentKey)."')";
			$strDB = "swdata";
			$oRec  = get_recordset($strSQL);
			while ($oRec->Fetch())
			{
				$description =  get_field($oRec,"type_display");
				$service_id =  get_field($oRec,"pk_config_type");

				$arrData['FK_SERVICE'] = $oServiceKey;
				$arrData['SERVICE_ID'] = pfs($service_id);
				$arrData['DESCRIPTION'] = pfs($description);
				$arrData['FLG_INCLUDE'] = $boolInclude;
				$arrData['APPLY_TYPE'] = "Per Request";
				$arrData['COST_TYPE'] = "Component";
				$arrData['FLG_CANCUSTOMISE'] = "0";
				$arrData['UNITS'] = "1";
				$arrData['TOTAL_COST'] = get_field($oRec,"bus_cost");
				$arrData['TOTAL_UNIT_COST'] = get_field($oRec,"bus_cost");
				$arrData['FLG_ISOPTIONAL'] = $boolOptional;
				$arrData['COST_WEIGHTING'] = "0";
				$arrData['TOTAL_COST_FOR_ITEM'] = get_field($oRec,"bus_cost");
				$arrData['PRICE'] = get_field($oRec,"bus_price");
				$arrData['GL_CODE'] = get_field($oRec,"gl_code");
				$strTable = "SC_RELS";
				$arc = xmlmc_addRecord($strTable,$arrData);
				if(1==$arc)
				{
					//-- Insert successful
				}
				else
				{
					return false;
				}
			}
			return true;
		}

		function add_component($oServiceKey, $strComponentKeys, $boolOptional=0)
		{
			$boolInclude = "1";
			if($boolOptional=="0")
			{
				$boolInclude = "0";
			}
			$strSQL  = "select * from sc_folio where fk_cmdb_id in (".pfs($strComponentKeys).")";
			$strDB = "swdata";
			$oRec  = get_recordset($strSQL);
			while ($oRec->Fetch())
			{
				$description =  get_field($oRec,"vsb_title");
				$service_id =  get_field($oRec,"service_name");
				$strCols = "FK_SERVICE,FK_KEY,SERVICE_ID,DESCRIPTION,FLG_INCLUDE,APPLY_TYPE,COST_TYPE,FLG_CANCUSTOMISE,UNITS,TOTAL_COST,TOTAL_UNIT_COST,FLG_ISOPTIONAL,COST_WEIGHTING,TOTAL_COST_FOR_ITEM,PRICE,GL_CODE";
				$strVals = pfs($oServiceKey).",".get_field($oRec,"fk_cmdb_id").",'".pfs($service_id)."','".pfs($description)."',".$boolInclude.",'Per Request','Component','0','1','".get_field($oRec,"cost_request")."','".get_field($oRec,"cost_request")."','".$boolOptional."','0','".get_field($oRec,"cost_request")."','".get_field($oRec,"cost_request")."','".get_field($oRec,"fld_kw6")."'";

				$strSQL = "INSERT INTO SC_RELS (".$strCols.") values (".$strVals.") ";
				if(!submitsql($strSQL))return false;
			}
			return true;
		}

		function remove_component($strKeys)
		{
			$strRels1SQL = "select PK_AUTO_ID from sc_rels where fk_service_rels in (".pfs($strKeys).") ";
			$aRel1Keys = $this->create_key_array($strRels1SQL,"PK_AUTO_ID");
			$this->xmlmc_deleteRecords($aRel1Keys ,"SC_RELS");

			$strRels2SQL = "select PK_AUTO_ID from sc_rels where pk_auto_id in (".pfs($strKeys).") ";
			$aRel2Keys = $this->create_key_array($strRels2SQL,"PK_AUTO_ID");
			$this->xmlmc_deleteRecords($aRel2Keys ,"SC_RELS");

			return true;

		}

		//-- given a CI type, return the service requests for it (including inherited)
		function create_ci_relationship($oServiceKey,$boolComponent=false)
		{
			$boolProcessOk=true;
			$origKey = $oServiceKey;
			$oServiceKey = pfs($oServiceKey);
			$boolComponent = (bool)$boolComponent;

			$strType = "Underpinning Service";
			if ($boolComponent)
			{
				$strType = "Component";
			}
			$intPerUser = 0;
			$intService = 0;

			//list of relationships without a cost
			$strSQL  = "SELECT CONFIG_RELI.* FROM CONFIG_RELI LEFT JOIN SC_RELS ON SC_RELS.FK_KEY =FK_CHILD_ID AND FK_SERVICE=FK_PARENT_ID WHERE FK_PARENT_ID = (".$oServiceKey.")    AND SC_RELS.PK_AUTO_ID IS NULL";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$type = (UC((get_field($oRS,"fk_child_type")))=="ME->SERVICE");
				if($type)
				{
					$childKey = get_field($oRS,"fk_child_id");
					$description = get_field($oRS,"childdesc");
					$childID = get_field($oRS,"fk_child_itemtext");
					$strSQL  = "SELECT * FROM SC_FOLIO WHERE FK_CMDB_ID = ".$childKey;
					$oRec  = get_recordset($strSQL,$strDB);
					//get service costs
					while ($oRec->Fetch())
					{
						get_field($oRec,"fk_child_id");

						$arrData['FK_SERVICE'] = $oServiceKey;
						$arrData['FK_KEY'] = $childKey;
						$arrData['SERVICE_ID'] = pfs($childID);
						$arrData['DESCRIPTION'] = pfs($description);
						$arrData['FLG_INCLUDE'] = 1;
						$arrData['APPLY_TYPE'] = "Maintenance";
						$arrData['FLG_CANCUSTOMISE'] = "0";
						$arrData['COST_TYPE'] = $strType;
						$arrData['UNITS'] = "1";
						$arrData['TOTAL_COST'] = get_field($oRec,"total_cost");
						$arrData['TOTAL_UNIT_COST'] = get_field($oRec,"total_unit_cost");
						$arrData['TOTAL_COST_FOR_ITEM'] = get_field($oRec,"total_cost_for_item");
						$arrData['PRICE'] = get_field($oRec,"total_cost_for_item");

					}
				}else
				{
					$parentKey = get_field($oRS,"fk_parent_id");
					$childKey = get_field($oRS,"fk_child_id");
					$childID = get_field($oRS,"fk_child_itemtext");
					$description = get_field($oRS,"childdesc");

					$arrData['FK_SERVICE'] = $parentKey;
					$arrData['FK_KEY'] = $childKey;
					$arrData['SERVICE_ID'] = pfs($childID);
					$arrData['DESCRIPTION'] = pfs($description);
					$arrData['FLG_INCLUDE'] = 1;
					$arrData['APPLY_TYPE'] = "Maintenance";
					$arrData['FLG_CANCUSTOMISE'] = "0";
					$arrData['COST_TYPE'] = "Underpinning CI";
					$arrData['UNITS'] = "1";
					$arrData['TOTAL_UNIT_COST'] = "";


				}
				$arc = xmlmc_addRecord("SC_RELS",$arrData);
				if(1==$arc)
				{
					//-- Record inserted successfully.
					$boolProcessOk=false;
				}
			}
			$this->update_service_costs($origKey);
			return 	$boolProcessOk=true;;
		}

		function update_service_costs($oServiceKey,$childKeys="")
		{
			$boolProcessOk=true;
			if($childKeys=="")
				$childKeys = "".$oServiceKey;
			else
				$childKeys = $childKeys.",".$oServiceKey;

			$arrValues = $this->get_service_costs($oServiceKey);

			$strSQL = "UPDATE SC_FOLIO SET COST_MAINTENANCE = '".pfs($arrValues[1])."',COST_SUBSCRIPTION = '".pfs($arrValues[0])."', COST_REQUEST = '".pfs($arrValues[2])."' WHERE FK_CMDB_ID = ".pfs($oServiceKey);
			if(!submitsql($strSQL))	$boolProcessOk=false;

			$strSQL  = "SELECT * FROM CONFIG_RELI WHERE FK_CHILD_ID = ".pfs($oServiceKey)." AND FK_PARENT_TYPE='ME->SERVICE' ";
			$strDB = "swdata";
			$arrChildren = explode($childKeys,",");
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$parentKey = "".get_field($oRS,"fk_parent_id");
				if(!in_array($arrChildren,$parentKey))
				{
					if(!$this->update_service_costs($parentKey,$childKeys))	$boolProcessOk=false;
				}
			}
			return 	$boolProcessOk;
		}


		function get_service_costs($oServiceKey,$intInitialUnitCost=0,$intBaseCost=0)
		{
			$intSubscription = 0;
			$intService = 0;
			$intRequest = 0;

			$strSQL  = "SELECT * FROM SC_RELS WHERE FK_SERVICE IN (".pfs($oServiceKey).") AND FLG_INCLUDE=1 AND (FLG_ISOPTIONAL=1 OR FLG_ISOPTIONAL IS NULL  OR FLG_ISOPTIONAL='')";//(FLG_ISOPTIONAL=0 OR FLG_ISOPTIONAL IS NULL)";
			$strDB = "swdata";
			$weighting = "";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				if(get_field($oRS,"apply_type")=="Per Request")
				{
					$intRequest = $intRequest + get_field($oRS,"total_cost_for_item");
				}
				else if(get_field($oRS,"apply_type")=="Per Subscription")
				{
					$intSubscription = $intSubscription+ get_field($oRS,"total_cost_for_item");
				}
				else
				{
					$weighting = get_field($oRS,"cost_weighting");
					if ($weighting=="")
					{
						$weighting = "0";
					}
					$intService = $intService + (get_field($oRS,"total_cost_for_item") * (($weighting + 100 ) / 100));
				}
			}
			$intSubscription = format_float_to_decimal_str(parseFloat($intSubscription));
			$intService = format_float_to_decimal_str(parseFloat($intService));
			$intRequest = format_float_to_decimal_str(parseFloat($intRequest));
			return Array($intSubscription,$intService,$intRequest);
		}

		function get_direct_customer_services($strKeysearch,$boolServices = true,$boolSetting,$strCallColumn)
		{
			$strServiceKeys = "";
			$strReturn = "fk_service";

			if (!$boolServices)
			{
				$strReturn = "pk_id";
			}
			if($boolSetting)
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION INNER JOIN SC_FOLIO ON SC_SUBSCRIPTION.FK_SERVICE = SC_FOLIO.FK_CMDB_ID WHERE " . $strCallColumn . " = 1 AND REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'userdb' AND FK_ME_KEY = '" . pfs($strKeysearch) ."'" ;
			}else
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION WHERE REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'userdb' AND FK_ME_KEY = '" . pfs($strKeysearch) ."'" ;
			}
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
					if($strServiceKeys!="")$strServiceKeys .=",";
					$strServiceKeys .= get_field($oRS,$strReturn);
			}

			return $strServiceKeys;
		}

		function get_organisation_services($strCompanyID,$boolServices, $boolSetting,$strCallColumn)
		{
			$strServiceKeys = "";

			$strReturn = "fk_service";
			if (!$boolServices)
			{
				$strReturn = "pk_id";
			}
			if($boolSetting)
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION INNER JOIN SC_FOLIO ON SC_SUBSCRIPTION.FK_SERVICE = SC_FOLIO.FK_CMDB_ID where " . $strCallColumn . " = 1 AND REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'company' AND FK_ME_KEY = '" . pfs($strCompanyID) . "'" ;
			}else
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION where REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'company' AND FK_ME_KEY = '" . pfs($strCompanyID) . "'" ;
			}
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
					if($strServiceKeys!="")$strServiceKeys .=",";
					$strServiceKeys .= get_field($oRS,$strReturn);
			}
			return $strServiceKeys;
		}

		function get_dept_services($strDeptID,$boolServices,$boolSetting,$strCallColumn)
		{
			$strServiceKeys = "";

			$strReturn = "fk_service";
			if (!$boolServices)
			{
				$strReturn = "pk_id";
			}
			if($boolSetting)
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION INNER JOIN SC_FOLIO ON SC_SUBSCRIPTION.FK_SERVICE = SC_FOLIO.FK_CMDB_ID where " . $strCallColumn . " = 1 AND REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'department' AND FK_ME_KEY = '" . pfs($strDeptID) . "'" ;
			}else
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION where REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'department' AND FK_ME_KEY = '" . pfs($strDeptID) . "'" ;
			}
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
					if($strServiceKeys!="")$strServiceKeys .=",";
					$strServiceKeys .= get_field($oRS,$strReturn);
			}
			return $strServiceKeys;
		}

		function get_site_services($strSiteID,$boolServices,$boolSetting,$strCallColumn)
		{
			$strServiceKeys = "";

			$strReturn = "fk_service";
			if (!$boolServices)
			{
				$strReturn = "pk_id";
			}
			if($boolSetting)
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION INNER JOIN SC_FOLIO ON SC_SUBSCRIPTION.FK_SERVICE = SC_FOLIO.FK_CMDB_ID where " . $strCallColumn . " = 1 AND REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'site' AND FK_ME_KEY = '" . pfs($strSiteID) . "'" ;
			}else
			{
				$strSQL  = "SELECT FK_SERVICE,PK_ID FROM SC_SUBSCRIPTION where REL_TYPE='SUBSCRIPTION' AND FK_ME_TABLE = 'site' AND FK_ME_KEY = '" . pfs($strSiteID) . "'" ;
			}
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
					if($strServiceKeys!="")$strServiceKeys .=",";
					$strServiceKeys .= get_field($oRS,$strReturn);
			}
			return $strServiceKeys;
		}

		function get_customer_services($strKeysearch,$boolServices,$boolSetting,$strCallClass)
		{

			$strServiceKeys = "";
			$oUserRec = get_record("USERDB", $strKeysearch);
			if(!$oUserRec)
			{
				return "";
			}

			if($strCallClass=="SR")
			{
				$strCallColumn = "displayonservicerequest";
			}
			else
			{
				$strCallColumn = "displayonincident";
			}

			$strCustService = $this->get_direct_customer_services($strKeysearch,$boolServices,$boolSetting,$strCallColumn);
			if($strCustService!="")
			{
				if($strServiceKeys!="")$strServiceKeys .=",";
				$strServiceKeys .= $strCustService;
			}

			$strOrgServices = $this->get_organisation_services($oUserRec['fk_company_id'],$boolServices,$boolSetting,$strCallColumn);
			if($strOrgServices!="")
			{
				if($strServiceKeys!="")$strServiceKeys .=",";
				$strServiceKeys .= $strOrgServices;
			}

			$strDeptServices = $this->get_dept_services($oUserRec['department'],$boolServices,$boolSetting,$strCallColumn);
			if($strDeptServices!="")
			{
				if($strServiceKeys!="")$strServiceKeys .=",";
				$strServiceKeys .= $strDeptServices;
			}

			$strSubDeptServices = $this->get_dept_services($oUserRec['subdepartment'],$boolServices,$boolSetting,$strCallColumn);
			if($strSubDeptServices!="")
			{
				if($strServiceKeys!="")$strServiceKeys .=",";
				$strServiceKeys .= $strSubDeptServices;
			}

			if($strServiceKeys=="")return "0";

			return $strServiceKeys;
		}

		function get_customer_view_services($strKeysearch,$boolServices)
		{
			$strServices = "0";
			$strPermission = "";

			$oUserRec = get_record("userdb", $strKeysearch);
			if(!$oUserRec)
			{
				//alert('Customer record could not be found.');
				return "";
			}

			$subServices = $this->get_customer_services($oUserRec['keysearch']);
			$strServices .= ",".$subServices;

			$strSQL = "select * from sc_subscription where REL_TYPE='VIEW' and FK_ME_TABLE='USERDB' and FK_ME_KEY='".pfs($oUserRec['keysearch'])."' and FK_SERVICE NOT IN (".$strServices.")";
			$oRS = get_recordset($strSQL,"swdata");
			while($oRS->Fetch())
			{
				$fetchSearch  = get_field($oRS,"permis_search");
				$fetchSeervice  = get_field($oRS,"fk_service");
				if($fetchSearch == "1")
				{
					if($strPermission != "")$strPermission .=",";
					$strPermission .=$fetchSeervice;
				}
				if($strServices != "")$strServices .=",";
				$strServices .=$fetchSeervice;
			}

			if($oUserRec['subdepartment']!="")
			{
				$strSQL = "select * from sc_subscription where REL_TYPE='VIEW' and FK_ME_TABLE='DEPARTMENT' and FK_ME_KEY='".pfs($oUserRec['subdepartment'])."' and FK_SERVICE NOT IN (".$strServices.")";
				$oRS = get_recordset($strSQL,"swdata");
				while($oRS->Fetch())
				{
					$fetchSearch  = get_field($oRS,"permis_search");
					$fetchSeervice  = get_field($oRS,"fk_service");
					if($fetchSearch == "1")
					{
						if(strPermission != "")$strPermission .=",";
						$strPermission .=$fetchSeervice;
					}
					if($strServices != "")$strServices .=",";
					$strServices .=$fetchSeervice;
				}
			}

			if($oUserRec['department']!="")
			{
				$strSQL = "select * from sc_subscription where REL_TYPE='VIEW' and FK_ME_TABLE='DEPARTMENT' and FK_ME_KEY='".pfs($oUserRec['department'])."' and FK_SERVICE NOT IN (".$strServices.")";
				$oRS = get_recordset($strSQL,"swdata");
				while($oRS->Fetch())
				{
					$fetchSearch  = get_field($oRS,"permis_search");
					$fetchSeervice  = get_field($oRS,"fk_service");
					if($fetchSearch == "1")
					{
						if($strPermission != "")$strPermission .=",";
						$strPermission .=$fetchSeervice;
					}
					if($strServices != "")$strServices .=",";
					$strServices .=$fetchSeervice;
				}
			}

			if($oUserRec['fk_company_id']!="")
			{
				$strSQL = "select * from sc_subscription where REL_TYPE='VIEW' and FK_ME_TABLE='COMPANY' and FK_ME_KEY='".pfs($oUserRec['fk_company_id'])."' and FK_SERVICE NOT IN (".$strServices.")";
				$oRS = get_recordset($strSQL,"swdata");
				while($oRS->Fetch())
				{
					$fetchSearch  = get_field($oRS,"permis_search");
					$fetchSeervice  = get_field($oRS,"fk_service");
					if($fetchSearch == "1")
					{
						if($strPermission != "")$strPermission .=",";
						$strPermission .=$fetchSeervice;
					}
					if($strServices != "")$strServices .=",";
					$strServices .=$fetchSeervice;
				}
			}

			if($strPermission=="")return "0";
			return $strPermission;
		}

		function get_customer_subscription($strKeysearch,$strServiceID,$strRelType="SUBSCRIPTION")
		{
			$oUserRec = get_record("USERDB", $strKeysearch);
			if(!$oUserRec)
			{
				return 0;
			}

			$strDB = "swdata";
			$strSQL  = "SELECT PK_ID FROM SC_SUBSCRIPTION where REL_TYPE='". pfs($strRelType) . "' AND FK_ME_TABLE = 'USERDB' AND FK_ME_KEY = '" . pfs($strKeysearch) . "' AND FK_SERVICE='". pfs($strServiceID) . "'" ;
			$oRS  = get_recordset($strSQL,$strDB);
			if ($oRS->Fetch())
			{
					return get_field($oRS,"pk_id");
			}

			$strSQL  = "SELECT pk_id from sc_subscription where REL_TYPE='". pfs($strRelType) . "' and fk_me_table = 'department' and fk_me_key = '" . pfs($oUserRec['subdepartment']) . "' and fk_service='" . pfs($strServiceID). "'" ;
			$oRS  = get_recordset($strSQL,$strDB);
			if ($oRS->Fetch())
			{
					return get_field($oRS,"pk_id");
			}

			$strSQL  = "SELECT pk_id from sc_subscription where REL_TYPE='" . pfs($strRelType) . "' and fk_me_table = 'department' and fk_me_key = '" . pfs($oUserRec['department']) . "' and fk_service='" . pfs($strServiceID). "'" ;
			$oRS  = get_recordset($strSQL,$strDB);
			if ($oRS->Fetch())
			{
					return get_field($oRS,"pk_id");
			}

			$strSQL  = "SELECT pk_id from sc_subscription where REL_TYPE='" . pfs($strRelType) . "' and fk_me_table = 'company' and fk_me_key = '" . pfs($oUserRec['fk_company_id']) . "' and fk_service='" . pfs($strServiceID). "'" ;
			$oRS  = get_recordset($strSQL,$strDB);
			if ($oRS->Fetch())
			{
					return get_field($oRS,"pk_id");
			}

			return -1;
		}

		function get_ci_service_request_type($strType,$boolAddQuotes=true,$strSep=",")
		{
			$strQuote = ($boolAddQuotes)?"'":"";
			$strPreparedValues = "";
			$strCITypes = "";
			$flg_inherit = 1;

			$strSQL  = "SELECT flg_inherit_reqtypes from config_typei where pk_config_type = '" .  pfs($strType) . "'";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
					$flg_inherit  = get_field($oRS,"flg_inherit_reqtypes");

					if($strCITypes!="")$strCITypes .=$strSep;
					$strCITypes .= "'" . $strType . "'";

					$strType = substr($strType, 0,strrpos($strType,'->'));
					$strSQL  = "SELECT flg_inherit_reqtypes from config_typei where pk_config_type = '" .  pfs($strType) . "'";
					$oRS  = get_recordset($strSQL,$strDB);
			}
			if($strCITypes=="")$strCITypes="''";

			$strSQL  = "select distinct fk_typecode from ct_profiles where fk_config_type in (" .  $strCITypes . ") and fk_config_item IS NULL order by fk_typecode";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				if($strPreparedValues!="")$strPreparedValues .=$strSep;
				$strPreparedValues .= $strQuote . pfs(get_field($oRS,"fk_typecode")) . $strQuote;
			}
			if($strPreparedValues=="")$strPreparedValues="''";
			return $strPreparedValues;


		}

		function generate_servicerelation($strKey,$ciKeys,$boolinCIisParent,$ynOperational,$boolOptional,$strDependancy)
		{
			$strSQL  = "select pk_auto_id, ck_config_type, ck_config_item, description from config_itemi where pk_auto_id = " .  $strKey ;
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$inKey  = get_field($oRS,"PK_AUTO_ID");
				$inText = get_field($oRS,"CK_CONFIG_ITEM");
				$inType = get_field($oRS,"CK_CONFIG_TYPE");
				$inDescription = get_field($oRS,"DESCRIPTION");
			}

			$fetchKey=0;
			$fetchType = "";
			$fetchText = "";
			//-- select the the ci fetch data rows
			$strSQL  = "select * from config_itemi where pk_auto_id in (" .  $ciKeys . ")";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$fetchKey  = get_field($oRS,"PK_AUTO_ID");
				$fetchText = get_field($oRS,"CK_CONFIG_ITEM");
				$fetchType = get_field($oRS,"CK_CONFIG_TYPE");
				$fetchDesc = get_field($oRS,"DESCRIPTION");

				$sqlResult = false;
				if($boolinCIisParent=='true')
				{
					//-- in ci is parent
					$sqlResult = $this->cmdb_insert_configrelation($inKey,$inType,$inText,$fetchKey,$fetchType,$fetchText,$strDependancy,$ynOperational,$inDescription,$fetchDesc,$boolOptional);
				}
				else
				{
					//-- in ci is child
					$sqlResult = $this->cmdb_insert_configrelation($fetchKey,$fetchType,$fetchText,$inKey,$inType,$inText,$strDependancy,$ynOperational,$fetchDesc,$inDescription,$boolOptional);
					$this->create_ci_relationship($fetchKey);
					$this->update_service_costs($fetchKey);
				}
				if(!$sqlResult)
				{
					return "Failed to build relationship between [". $inText ."] and [". $fetchText ."]. Please contact your Supportworks Administrator";
				}
			}
			return true;
		}

		function generate_configrelation($strKey,$ciKeys,$boolinCIisParent,$ynOperational,$boolOptional,$strDependancy)
		{

			$strSQL  = "select pk_auto_id, ck_config_type, ck_config_item, description from config_itemi where pk_auto_id = " .  $strKey ;
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$inKey  = get_field($oRS,"PK_AUTO_ID");
				$inText = get_field($oRS,"CK_CONFIG_ITEM");
				$inType = get_field($oRS,"CK_CONFIG_TYPE");
				$inDescription = get_field($oRS,"DESCRIPTION");
			}

			$fetchKey=0;
			$fetchType = "";
			$fetchText = "";
			//-- select the the ci fetch data rows
			$strSQL  = "select * from config_itemi where pk_auto_id in (" .  $ciKeys . ")";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			while ($oRS->Fetch())
			{
				$fetchKey  = get_field($oRS,"PK_AUTO_ID");
				$fetchText = get_field($oRS,"CK_CONFIG_ITEM");
				$fetchType = get_field($oRS,"CK_CONFIG_TYPE");
				$fetchDesc = get_field($oRS,"DESCRIPTION");


				$sqlResult = false;
				if($boolinCIisParent=='true')
				{
					//-- in ci is parent
					$sqlResult = $this->cmdb_insert_configrelation($inKey,$inType,$inText,$fetchKey,$fetchType,$fetchText,$strDependancy,$ynOperational,$inDescription,$fetchDesc,$boolOptional);
				}
				else
				{
					//-- in ci is child

					$sqlResult = $this->cmdb_insert_configrelation($fetchKey,$fetchType,$fetchText,$inKey,$inType,$inText,$strDependancy,$ynOperational,$fetchDesc,$inDescription,$boolOptional);
				}
				if(!$sqlResult)
				{
					return "Failed to build relationship between [". $inText ."] and [". $fetchText ."]. Please contact your Supportworks Administrator";
				}
			}
			$this->create_ci_relationship($inKey);
			$this->update_service_costs($inKey);
		return true;
		}

		function cmdb_insert_configrelation($parentKey, $parentType, $parentText, $childKey, $childType, $childText, $strDependancy, $ynOperational, $strParentDesc, $strChildDesc, $boolOption){

			$strSQL = "select count(*) as ACOUNTER from CONFIG_RELI where FK_PARENT_ID = " . $parentKey . " AND FK_CHILD_ID = " . $childKey . " AND FK_DEPENDENCY_TYPE = '" . $strDependancy . "'";
			$oRs = new SqlQuery();
			$oRs->Query($strSQL);

			//-- Check for XMLMC Error
			if($oRs->result==false)
			{
				return false;
			}
			//-- END
			if($oRs->Fetch())
			{
				$intCount  = $oRs->GetValueAsNumber("acounter");
				if($intCount>0)
				{
					// -- If a record exists in CONFIG_RELI, then update the columns data
					$strSelect = "SELECT PK_AUTO_ID FROM CONFIG_RELI WHERE FK_PARENT_ID = " . $parentKey . " AND FK_CHILD_ID = " . $childKey . " AND FK_DEPENDENCY_TYPE = '" . $strDependancy . "'";
					$oRs = new SqlQuery();
					$oRs->Query($strSelect);
					$intID = "";
					if($oRs->Fetch()) $intID = get_field($oRs,"PK_AUTO_ID");

					$strTable = "CONFIG_RELI";
					$arrData['PK_AUTO_ID'] = $intID;
					$arrData['PARENTDESC'] = pfs($strParentDesc);
					$arrData['CHILDDESC'] = pfs($strChildDesc);
					$arrData['FK_PARENT_TYPE'] = pfs($parentType);
					$arrData['FK_PARENT_ITEMTEXT'] = pfs($parentText);
					$arrData['FK_CHILD_TYPE'] = pfs($childType);
					$arrData['FK_CHILD_ITEMTEXT'] = pfs($childText);
					$arrData['FLG_OPERATIONAL'] = pfs($ynOperational);
					$arc = xmlmc_updateRecord($strTable,$arrData);
					if(1==$arc) return true;
					else return false;
				}
			}
			$strTable = "CONFIG_RELI";
			$arrData['PARENTDESC'] = pfs($strParentDesc);
			$arrData['CHILDDESC'] = pfs($strChildDesc);
			$arrData['FK_PARENT_ID'] = pfs($parentKey);
			$arrData['FK_PARENT_TYPE'] = pfs($parentType);
			$arrData['FK_PARENT_ITEMTEXT'] = pfs($parentText);
			$arrData['FK_CHILD_ID'] = pfs($childKey);
			$arrData['FK_CHILD_TYPE'] = pfs($childType);
			$arrData['FK_CHILD_ITEMTEXT'] = pfs($childText);
			$arrData['FK_DEPENDENCY_TYPE'] = pfs($strDependancy);
			$arrData['FLG_OPERATIONAL'] = pfs($ynOperational);
			$arc = xmlmc_addRecord($strTable,$arrData);
			if(1==$arc)
			{
				return true;
			}
			else
			{
				//-- Function from app.helpers.php to process error message.
				return false;
			}
		}

		function delete_subscription($intPK)
		{
			$strSQL  = "select * from sc_subscription where pk_id = " .  $intPK;
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			if($oRS->Fetch())
			{
				$strMEKey  = get_field($oRS,"FK_ME_KEY");
				$strMETable = get_field($oRS,"FK_ME_TABLE");
				$intService = get_field($oRS,"FK_SERVICE");
				$rec = get_record($strMETable, $strMEKey);
				if($rec["fk_cmdb_id"]!="")
				{
					$this->delete_meconfigrelation($rec["fk_cmdb_id"],$intService);
				}
				xmlmc_deleteRecord("SC_SUBSCRIPTION",pfs($intPK));

				$strSQL  = "select PK_AUTO_ID from SC_SLA where fk_subscription =".pfs($intPK);
				$oRS  = get_recordset($strSQL,"swdata");
				while($oRS->Fetch())
				{
					$intSlaKey  = get_field($oRS,"PK_AUTO_ID");
					xmlmc_deleteRecord("SC_SLA",pfs($intSlaKey ));
				}
				return true;
			}
			return false;
		}
		function delete_meconfigrelation($strCI,$strChildID)
		{
			$strSQL  = "select PK_AUTO_ID from CONFIG_RELI where FK_PARENT_ID = ".pfs($strCI)." and FK_CHILD_ID in (".$strChildID.")";
			$strDB = "swdata";
			$oRS  = get_recordset($strSQL,$strDB);
			if($oRS->Fetch())
			{
				$strPkAutoId  = get_field($oRS,"PK_AUTO_ID");
			}
			$strTable = "CONFIG_RELI";
			xmlmc_deleteRecord($strTable,$strPkAutoId);
		}
	}

	function get_cust_owned_rels($strCustID, $strRelType)
	{
		$array_rel_ids = Array();
		$strSQL  = "select fk_child_id from config_reli where fk_parent_itemtext='".pfs($strCustID)."' and fk_child_type='".pfs($strRelType)."'";
		$strDB = "swdata";
		$oRS  = get_recordset($strSQL,$strDB);
		while ($oRS->Fetch())
		{
			$array_rel_ids[get_field($oRS,"fk_child_id")] = get_field($oRS,"fk_child_id");
		}
		return implode(",",$array_rel_ids);
	}

	function get_cust_avail_rels($strOrgID, $strSiteID, $strDeptID, $strSubDeptID)
	{
		$array_rel_ids = Array();
		$strSQL = "select fk_child_id from config_reli where ( (fk_parent_type = 'ME->COMPANY' and fk_parent_itemtext = '".pfs($strOrgID)."') OR (fk_parent_type = 'ME->SITE' and fk_parent_itemtext = '".pfs($strSiteID)."') OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".pfs($strDeptID)."') OR (fk_parent_type = 'ME->DEPARTMENT' and fk_parent_itemtext = '".pfs($strDeptID)."'))";
		$strDB = "swdata";
		$oRS  = get_recordset($strSQL,$strDB);
		while ($oRS->Fetch())
		{
			$array_rel_ids[get_field($oRS,"fk_child_id")] = get_field($oRS,"fk_child_id");
		}
		return implode(",",$array_rel_ids);
	}

	//-- instance for developers to use in the scripts
	global $service;
	$service = new serviceFunctions();
}
?>
