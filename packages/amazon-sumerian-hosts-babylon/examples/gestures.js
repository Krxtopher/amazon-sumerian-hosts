import SumerianHostUtils from './lib/sumerian-host-utils.js';

// TODO: Update this value to match a Cognito Identity Pool created in your AWS
// account. The unauthenticated IAM role for the pool (usually ending in the
// suffix "Unauth_Role") must have the following managed permissions policies
// assigned to it:
//   - AmazonPollyReadOnlyAccess
//   - AmazonLexRunBotsOnly
const cognitoIdentityPoolId = 'us-east-1:9ca92f95-1959-4ceb-9206-b1d0549a0cce';

// TODO: Edit the pollyVoice value if you would like the change the Polly voice used by
// the character. See https://docs.aws.amazon.com/polly/latest/dg/voicelist.html
const pollyVoice = 'Joanna';

// TODO: Edit the pollyEngine value if you would like to change which voice
// engine is used. Allowed values are "standard" or "neural". Note that the
// neural engine incurs a higher cost and is not compatible with all voices and
// regions. See https://docs.aws.amazon.com/polly/latest/dg/NTTS-main.html
const pollyEngine = 'neural';

// TODO: Edit the characterId if you would like to use one of the other
// pre-built host characters. Available character IDs are: "Cristine", "Fiona",
// "Grace", "Maya", "Jay", "Luke", "Preston", "Wes"
const characterId = 'Cristine';

let host;

async function createScene(canvas) {
  const { scene, camera } = createEnvironment(canvas);

  // Configure the AWS SDK. This is required when using hosts.
  AWS.config.region = cognitoIdentityPoolId.split(':')[0];
  AWS.config.credentials = new AWS.CognitoIdentityCredentials(
    { IdentityPoolId: cognitoIdentityPoolId },
  );

  // Instantiate the host.
  const characterConfig = SumerianHostUtils.getCharacterConfig('./assets/glTF', characterId);
  const pollyConfig = { pollyVoice, pollyEngine };
  host = await SumerianHostUtils.createHost(scene, characterConfig, pollyConfig);

  // Tell the host to always look at the camera.
  host.PointOfInterestFeature.setTarget(camera);

  initUi();

  scene.render();

  return scene;
}

function createEnvironment(canvas) {
  // Create an empty scene. IMPORTANT: Sumerian Hosts require that the scene
  // be configued to use the right-hand coordinate system!
  const scene = new BABYLON.Scene();
  scene.useRightHandedSystem = true;

  // Create a simple environment.
  const environmentHelper = scene.createDefaultEnvironment();
  environmentHelper.setMainColor(BABYLON.Color3.Teal());
  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(-0.3, 1, 0));

  // Add a camera.
  const cameraRotation = BABYLON.Angle.FromDegrees(85).radians();
  const cameraPitch = BABYLON.Angle.FromDegrees(70).radians();
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    cameraRotation,
    cameraPitch,
    2.6,
    new BABYLON.Vector3(0, 1.0, 0));
  camera.wheelDeltaPercentage = 0.01;
  camera.minZ = 0.01;
  camera.attachControl(canvas, true);

  return { scene, camera, light };
}

function initUi() {
  // Init Gesture menu handlers.
  const gestureSelect = document.getElementById('gestureSelect');
  gestureSelect.addEventListener('change', (evt) => playGesture(evt.target.value));

  // Init Emote menu handlers.
  const emoteSelect = document.getElementById('emoteSelect');
  emoteSelect.addEventListener('change', (evt) => playEmote(evt.target.value));

  // Reveal the UI.
  document.getElementById('uiPanel').classList.remove('hide');
}

function playGesture(name) {
  if (!name) return;

  // This options object is optional. It's included here to demonstrate the available options.
  const gestureOptions = {
    holdTime: 1.5, // how long the gesture should last
    minimumInterval: 0 // how soon another gesture can be triggered
  };
  host.GestureFeature.playGesture('Gesture', name, gestureOptions);
}

function playEmote(name) {
  if (!name) return;

  host.GestureFeature.playGesture('Emote', name);
}

export default createScene;