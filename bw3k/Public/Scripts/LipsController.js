// @input bool advanced = false
// @input Asset.Texture mouthClosedMask {"showIf":"advanced"}
// @input Component.FaceMaskVisual faceMask {"showIf":"advanced"}

const BOUND_EPS = 0.02;
const DELTA = 0.005;
var isFaceTracking = false;
var faceIndex = 0;
var faceMaskPass;

var mouthClosedMask = script.mouthClosedMask;
var mouthOpenedMask;

var head = script.getSceneObject().createComponent("Component.Head"); 

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
updateEvent.enabled = false;

var faceFoundEvent = script.createEvent("FaceFoundEvent");
faceFoundEvent.bind(onFaceFound);
faceFoundEvent.enabled = false;

var faceLostEvent = script.createEvent("FaceLostEvent");
faceLostEvent.bind(onFaceLost);
faceLostEvent.enabled = false;

function onUpdate() 
{
	if (isFaceTracking) { 
    	var upperLip = head.getLandmark(62);
    	var lowerLip = head.getLandmark(66);
        var headUp = head.getLandmark(71);
        var chin = head.getLandmark(8);
        
    	var dist = upperLip.distance(lowerLip) / Math.abs(headUp.distance(chin));
     
    	if (dist < BOUND_EPS - DELTA) {
    		faceMaskPass.opacityTex = mouthClosedMask;
    	} else if (dist > BOUND_EPS + DELTA){
    		faceMaskPass.opacityTex = mouthOpenedMask;
    	}
    }
}

function onFaceFound()
{
    isFaceTracking = true;
}

function onFaceLost()
{
    isFaceTracking = false;
}

function initialize() 
{
    if (script.mouthClosedMask) {
        mouthClosedMask = script.mouthClosedMask
    }
    else {
        print("[LipsController] ERROR: Please set Mask texture that coresponds to closed mouth state in Advanced section");        
        return;
    }
    
    if (script.faceMask) {
        setFaceIndex(script.faceMask.faceIndex);
        
        if (script.faceMask.mainPass) {
            faceMaskPass = script.faceMask.mainPass;
            mouthOpenedMask = faceMaskPass.opacityTex;
            
            updateEvent.enabled = true;
     
            faceFoundEvent.enabled = true;
            faceLostEvent.enabled = true;
            
        }
        else {
            print("[LipsController] ERROR: Material is not set for " + script.faceMask.getSceneObject().name);
        }
    } 
    else {
    	print("[LipsController] ERROR: Please set FaceMask in Advanced section");
    }
}

function setFaceIndex(index) {
    faceIndex = index;
    
    head.faceIndex = faceIndex;
    
    faceFoundEvent.faceIndex = faceIndex;
    faceLostEvent.faceIndex = faceIndex;
}

script.api.initialize = initialize;
script.api.setFaceIndex = setFaceIndex;

initialize();