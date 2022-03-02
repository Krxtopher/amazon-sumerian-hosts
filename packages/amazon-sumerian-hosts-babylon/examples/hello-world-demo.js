import SumerianHostUtils from './lib/sumerian-host-utils.js';
import DemoUtils from './lib/demo-utils.js';

// TODO: Update this value to match a Cognito Identity Pool created in your AWS
// account. The unauthenticated IAM role for the pool (usually ending in the
// suffix "Unauth_Role") must have the following managed permissions policies
// assigned to it:
//   - AmazonPollyReadOnlyAccess
//   - AmazonLexRunBotsOnly
const cognitoIdentityPoolId = 'us-east-1:9ca92f95-1959-4ceb-9206-b1d0549a0cce';

let host;
let scene;

async function createScene() {
  // Create an empty scene. IMPORTANT: Sumerian Hosts require use of the
  // right-hand coordinate system!
  scene = new BABYLON.Scene();
  scene.useRightHandedSystem = true; // IMPORTANT for Sumerian Hosts!

  DemoUtils.setupSceneEnvironment(scene);
  initUi();

  // ===== Configure the AWS SDK =====

  AWS.config.region = cognitoIdentityPoolId.split(':')[0];
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(
    { IdentityPoolId: cognitoIdentityPoolId },
  );

  // ===== Instantiate the Sumerian Host =====

  // Edit the characterId if you would like to use one of
  // the other pre-built host characters. Available character IDs are:
  // "Cristine", "Fiona", "Grace", "Maya", "Jay", "Luke", "Preston", "Wes"
  const characterId = 'Cristine';
  const pollyConfig = { pollyVoice: 'Joanna', pollyEngine: 'neural' };
  const characterConfig = SumerianHostUtils.getCharacterConfig('./assets/glTF', characterId);
  host = await SumerianHostUtils.createHost(scene, characterConfig, pollyConfig);

  // Tell the host to always look at the camera.
  const camera = scene.cameras[0];
  host.PointOfInterestFeature.setTarget(camera);

  return scene;
}

function initUi() {
  document.getElementById('speakButton').onclick = speak.bind(this);
}

function speak() {
  const speech = document.getElementById('speechText').value;
  host.TextToSpeechFeature.play(speech);
}

export default createScene;