<?php
/**
 * SAML 2.0 remote IdP metadata for SimpleSAMLphp.
 *
 * Remember to remove the IdPs you don't use from this file.
 *
 * See: https://simplesamlphp.org/docs/stable/simplesamlphp-reference-idp-remote 
 */

/*
 * Guest IdP. allows users to sign up and register. Great for testing!
 */
<?php
/**
 * SAML 2.0 remote SP metadata for SimpleSAMLphp.
 *
 * See: https://simplesamlphp.org/docs/stable/simplesamlphp-reference-sp-remote
 */

/*
 * Example SimpleSAMLphp SAML 2.0 SP
 */
$metadata['https://sts.opensource.gov/adfs/services/trust'] = array (
  'entityid' => 'https://sts.opensource.gov/adfs/services/trust',
  'contacts' => 
  array (
    0 => 
    array (
      'contactType' => 'support',
    ),
  ),
  'metadata-set' => 'saml20-sp-remote',
  'AssertionConsumerService' => 
  array (
    0 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'https://sts.opensource.gov/adfs/ls/',
      'index' => 0,
      'isDefault' => true,
    ),
    1 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Artifact',
      'Location' => 'https://sts.opensource.gov/adfs/ls/',
      'index' => 1,
    ),
    2 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      'Location' => 'https://sts.opensource.gov/adfs/ls/',
      'index' => 2,
    ),
  ),
  'SingleLogoutService' => 
  array (
    0 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      'Location' => 'https://sts.opensource.gov/adfs/ls/',
    ),
    1 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'https://sts.opensource.gov/adfs/ls/',
    ),
  ),
  'NameIDFormat' => 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  'keys' => 
  array (
    0 => 
    array (
      'encryption' => true,
      'signing' => false,
      'type' => 'X509Certificate',
      'X509Certificate' => 'MIIC5jCCAc6gAwIBAgIQSrkp1TzT+JxLBOQjwLAiIzANBgkqhkiG9w0BAQsFADAvMS0wKwYDVQQDEyRBREZTIEVuY3J5cHRpb24gLSBzdHMub3BlbnNvdXJjZS5nb3YwHhcNMTcxMDE5MDAzNTQ3WhcNMTkxMDE5MDAzNTQ3WjAvMS0wKwYDVQQDEyRBREZTIEVuY3J5cHRpb24gLSBzdHMub3BlbnNvdXJjZS5nb3YwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDWyxTsvosAamUq8Pw+cNGEmWMKh7RkwCBec2UG5NLGcn2wPTSGYZKvK3BQqMNCY4cStehAQonuTCDsiCMOQNXeAa+HkXnvEQQ3yMkjSnnlpvlvt4r693jPp11335e5Yx1HxX/DHuK9C0BaZ/aByH14I8bqmeTfmaFVFf23xV3jXwFveOAyUdFEaZWkNwuYTzSfADfXOTHVZSMvjpSQqy5PxVmmmWaA9dtgTCsoQZ5JhTTmbudNhQwYZANH5jcV2JU0hnIfFec2aBSju8jBn04xHkDQx25pXe6LqIhmNXBG4UBr7QMUsdvLpVAeV/XCXcgZXsE8HdHyG80m3JRrzrtFAgMBAAEwDQYJKoZIhvcNAQELBQADggEBALNDvBW3LknLdurkSwX2NqXivhhlPqaUBIJpuAHEWvL349ACkzsquAEz0fLwBoxLftrce72fV6kpcpBYFOh2f4FRYSn43vBBlKuL42t++HR/fTdZzZZ+NeuyyCaa1axGVRGdLd7B35I2zuYp/ItQMi6I81NNkPw4sM/unWNtR9d2mQhS+vYfbydNakBR5LwWCM1QLfoR+GqZB8JSBqX6P1hbDA3+tZgO+r61pHLe04osDK+yyzX3FwcKRHu4qECMuOWjnVvn9k8sT5bu8GgtFGZtKSigB/3zLcCSuvMzUfKKS08Tx3qGdQN6G9q6DX0rocfCsvvFdJv6g4j4pFRZicU=',
    ),
    1 => 
    array (
      'encryption' => false,
      'signing' => true,
      'type' => 'X509Certificate',
      'X509Certificate' => 'MIIC4DCCAcigAwIBAgIQHt7wyTbaiK9Lhz2X1FDTDzANBgkqhkiG9w0BAQsFADAsMSowKAYDVQQDEyFBREZTIFNpZ25pbmcgLSBzdHMub3BlbnNvdXJjZS5nb3YwHhcNMTcxMDE5MDAzNTQ3WhcNMTkxMDE5MDAzNTQ3WjAsMSowKAYDVQQDEyFBREZTIFNpZ25pbmcgLSBzdHMub3BlbnNvdXJjZS5nb3YwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDfalMf4MSgmsPUj+njm96c70T+XanbvKHoP02v8triVBlUapWlRf8zx/U3BBt0ShZyiHhbO99rpEqUXZOq1aAOgWJyZQHsbAoDFZ/gtMESvjEcyiMFSaAz2pJ14VC+fDWtqG9/ytcJgfg3fkun63vzbj1fEEqSrudE0iPAFkZIZCl3cPvorcodUAv3btfehJpHPBBVuJWqtedqwpPQuuCZK0YsTxllLhh73qrMPpIhLnge0sTFJU6T5HAQgOz+2nXuXNlL+Y+N+LnHE/KUWF2Veu75t/v/EAKKdZqKCfYwDboglKBr4yoVcmkPoKDj/xCQt8QhIq2IDpCE1K7fw3BtAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAMjU9ZrGTYY0ffP074p4HUng6imHzkczKA17bqLfF4K/H9mFdhKUJupmrlWqeu9RWL1PnaydPurH3GxvI0ZWZzMX4sSwlKkz6qZ8dam98R1PJJjkBIWm4K6ux8kFLlcN6B8tysqet5GQb8ekDAXdFb7h3Q+xUFKaYTR5cPnjz6OPq/1vK9E636uyYq8yzDpe5ukEM2O/x5IuB3JaUI7u/AMe6r/oa1v2PUnv5j2dYyyGrJ3VrKkD+q1mx70TR1VAk4A35twd29vPyCW5qq5fhYALWXskTQuDRuXPTjYI5+2Rq0v1qUTizLCQv0acU9Vps9sG0QiAFvG3Zh6FFtWz/uc=',
    ),
  ),
  'saml20.sign.assertion' => true,
);


