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
$metadata['http://swadfs.SW.test/adfs/services/trust'] = array (
  'entityid' => 'http://swadfs.SW.test/adfs/services/trust',
  'contacts' => 
  array (
  ),
  'metadata-set' => 'saml20-idp-remote',
  'SingleSignOnService' => 
  array (
    0 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      'Location' => 'https://swadfs.sw.test/adfs/ls/',
    ),
    1 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'https://swadfs.sw.test/adfs/ls/',
    ),
  ),
  'SingleLogoutService' => 
  array (
    0 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
      'Location' => 'https://swadfs.sw.test/adfs/ls/',
    ),
    1 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
      'Location' => 'https://swadfs.sw.test/adfs/ls/',
    ),
  ),
  'ArtifactResolutionService' => 
  array (
    0 => 
    array (
      'Binding' => 'urn:oasis:names:tc:SAML:2.0:bindings:SOAP',
      'Location' => 'https://swadfs.sw.test/adfs/services/trust/artifactresolution',
      'index' => 0,
    ),
  ),
  'NameIDFormats' => 
  array (
    0 => 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    1 => 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
    2 => 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  ),
  'keys' => 
  array (
    0 => 
    array (
      'encryption' => true,
      'signing' => false,
      'type' => 'X509Certificate',
      'X509Certificate' => 'MIIC3jCCAcagAwIBAgIQH7U0Q1eIPatEP75NoWxP/jANBgkqhkiG9w0BAQsFADArMSkwJwYDVQQDEyBBREZTIEVuY3J5cHRpb24gLSBzd2FkZnMuU1cudGVzdDAeFw0xNzEwMjQxNjI1MjNaFw0xODEwMjQxNjI1MjNaMCsxKTAnBgNVBAMTIEFERlMgRW5jcnlwdGlvbiAtIHN3YWRmcy5TVy50ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6xFt2dZYCaQueqNE+qT5q+5ChIKVgwoZw2RPfD0f9EzrKdYb/pa8o9ScwE2aX0y6HVF1eq/BJTsCNZ7HltECXBtr7ZpL/KQGKjziqV5HA8PFCIfzYe0ltWUmoyRd85kFfBpHZ7HOXEYcp3QQ4MzreseooqZL0GaqK3E9SOGd1uDOqGqy4j6aD/ZcxinDFtNHOyFoUHQwFp7vBU9xpnm135lt3HWoAt62jt3Xq2GJ8MXn8JQjjPa4u//WLtt/0kRC8+DrV/SYiUoZd2Q5SaC09ju3Sb0xmVmcEqMzdzuXCOEzPD3zXpQ2Xx/FpCTNSJHM3ADCm2t7PUoI1EtxmKz+qwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCW7KqJ4Ro7a8IOEEVIKBxBN7GMFLhbDqDzhdGwR5wCuLcULdieE4DRfXBOcu0loQcdHYwhY35yurvmhSGzLAEM0/qekmGcWyvOdFzk4mKI+MvnCe+Tme7gUsOgYEZdXDtb9lYe09G+uLkfv9XCCV+uVgg7Ebv8nrRUpfyJYIF5MmsPUpkGtftw/kPVJ54wYYnxkPSxoptTaCrL8UiRBgXSWxodwCp3QPNrn5CQReW2sbu7BbGfhymg7o5cTIXnwGUIaKOFkFCyiiUaJLqQ4E8FjA7tfgT6tX35XFn4LssNwEjX7IfMh4Uz8zJ7Jc7iN/oRPjhjyJGvrSSBgtfprmUW',
    ),
    1 => 
    array (
      'encryption' => false,
      'signing' => true,
      'type' => 'X509Certificate',
      'X509Certificate' => 'MIIC2DCCAcCgAwIBAgIQFk51n1EIjqlGD2F1bEq/EDANBgkqhkiG9w0BAQsFADAoMSYwJAYDVQQDEx1BREZTIFNpZ25pbmcgLSBzd2FkZnMuU1cudGVzdDAeFw0xNzEwMjQxNjI1MjJaFw0xODEwMjQxNjI1MjJaMCgxJjAkBgNVBAMTHUFERlMgU2lnbmluZyAtIHN3YWRmcy5TVy50ZXN0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr4hlJ9z1ZpvoQuXWboHEM9rJqD/yUw0ySTvI/XwF9J64zB1PS/Iy7zqm2zF00hqi9NIygYDQdsqD6v4Y5U9gYc0EFAfEWCmT9QbXypC7QMp+BcutL0hamcUuOZ050V2jcf6gM0qmR43QhO855XP17OHK/RNWxDpbBpEmq4bmLpFX4+KDcxuRBff6Hd53UJY72lzzNqN5S87gvrYj7qNYnf2O2TEYjhXoEzkpP/dz8DlYcaMxe3u3kYmJ7vGzAq4wVCtvFrU5HobTl3cNJDw9ocMuwhJMAZTYDXMq5F4Nxu2jYDJ/Do8Uw6N86/zBcTkXPGh5OoO0fMxiOrFzVK+nwQIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCSK8JWtbn4wKWD33pc7i6pZ9TTRUmdVjU2miuf5x+QfvoEJJ+7Ee/qU023rdCb35EXmCsoFz70Fm1Z9Fkff2EH8hzl2yfxh2zHxF+s9wbjn3cXDoavVh9UdNqUIhXY/4X8q2RKnLkoxCt394QiNBuPf6zjo1GyQPBK2GtWmUTQ5ZvQ3fdta2mdaVn0iIoOMIuSYUazLkfImOG69qz6qfLVnq8wy9VNSatoIHwQRoUnL5Eg1d1xpQX8n5XGXKmQoVwB9jVycopxSJkuk78LuiJsF4cZ/kyWBIXqZdgIR3TygYgCibBrPnhyR6b0bpHNLY1yWfm5X9lMrrakQfFTxooZ',
    ),
  ),
);

