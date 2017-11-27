# IN00148939

While integrating single sign on with the webclient a problem was discovered where the trusted logon authentication of Supportworks 
would fail even when the proper credentials were supplied. Incident IN00148939 was raised to address this issue and it was determined
that a patch would need to be implemented to correct this issue. The patch is deployed in wcsetup.exe. An unrelated security issue
surrounding core services will also be addressed in this package, this security issue is patched in CS601-patch.exe