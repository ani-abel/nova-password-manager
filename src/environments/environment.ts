// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: 'AIzaSyBxtAyJ4Y4jxpr1KbAZugYsovphi10uh98',
    authDomain: 'origami-portal-ead60.firebaseapp.com',
    databaseURL: 'https://origami-portal-ead60.firebaseio.com',
    projectId: 'origami-portal-ead60',
    storageBucket: 'origami-portal-ead60.appspot.com',
    messagingSenderId: '354284544073',
    appId: '1:354284544073:web:0475f021a48c00c00d5f98'
  },
  aws: {
    endpoint: 'https://nova-password-manager.s3.us-east-2.amazonaws.com/',
    wavDataEndpoint: 'https://nova-password-manager.s3.us-east-2.amazonaws.com/Wav-files/',
    region: 'us-east-2',
    bucketName: 'nova-password-manager',
    accessKeyId: 'AKIAYSH6RZRFLZWAZ4IS',
    secretAccessKey: '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',
    keyName: 'Wav-files',
  },
  voiceIt: {
    apiEncryptedToken: 'a2V5XzU4ZWY2ZTBmYWZhNzQ0MjQ4NTkwN2QxYWFlZjBmZjQzOnRva18xNTFmOTAzMTUxOTM0MTNhYmU2ODEzYmIzMzU0YzAxMA==',
    apiKey: 'key_58ef6e0fafa7442485907d1aaef0ff43',
    apiToken: 'tok_151f90315193413abe6813bb3354c010'
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
