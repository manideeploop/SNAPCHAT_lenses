// -----JS CODE-----
// StyleTransferController.js
// Version: 0.0.1
// Event: Initialized
// Description: This script demonstrates how you can adapt your ML Lenses based on device performance. 

//@input Component.MLComponent mlComponent
//@input int runMode = 1 {"widget":"combobox", "values":[{"label":"Adapt to Device Performance", "value":1}, {"label":"Run Always", "value":2}, {"label":"Run on Tap", "value":3}]}
//these names have to match your model input and output names
//@input string inputName
//@input string outputName

//@input Component.MaterialMeshVisual outputImage
//@ui {"widget":"separator"}
//@input bool advanced
//@input SceneObject loader {"showIf" : "advanced"}
//@input SceneObject photoButton  {"showIf" : "advanced"}
//@input SceneObject resetButton  {"showIf" : "advanced"}


var mlComponent;
var config;
var currentDevicePerformanceIndex;
var frameProcessed = false;

// If using `Adapt to Device Performance` mode and 
// current device's  ML performance index is less 
// than this value, Lens will use `Run on Tap` mode.
var lowMLPerformanceIndexBreakpoint = 4;

function init() {
    if (!checkAllInputSet()) {
        return;
    }
    
    mlComponent = script.mlComponent;
    mlComponent.onLoadingFinished = wrapFunction(mlComponent.onLoadingFinished, onMLLoaded);
    mlComponent.build([]);
    
    // Represents the device's ML performance.
    // The higher the number, the faster the performance.
    // As of April 2020, the range of index is (0 - 8).
    // As more performant device become available, the maximum index will increase.

    currentDevicePerformanceIndex = global.deviceInfoSystem.performanceIndexes.ml;
}

function onMLLoaded() {
    
    config = getConfig();

    if (config) {
        setupRunSettings(currentDevicePerformanceIndex);
    }
}

function getConfig() {

    var mlOutput;
    var mlInput;
    //check input and output texture
    try {
        var mlInput = mlComponent.getInput(script.inputName);
    } catch (e) {
        debugPrint(e + ". Please set valid Input Name that is matching MLAsset input name");
        return null;
    }
    if (!mlInput.texture) {
        debugPrint("Error, Please set input texture on the ML Component");
    }
    //check input and input texture
    try {
        var mlOutput = mlComponent.getOutput(script.outputName);
    } catch (e) {
        debugPrint(e + ". Please set valid Output Name that is matching MLAsset output name");
        return null;
    }
    if (!mlOutput.texture) {
        debugPrint("Error, Please create Output Texture on the ML Component");
    }

    return {
        input: mlInput,
        output: mlOutput
    };
}

function setupRunSettings(index) {
    var shouldRunOnDemand = (script.runMode == 1 && index < lowMLPerformanceIndexBreakpoint) || (script.runMode == 3);

    if (shouldRunOnDemand) {
        runOnDemand();
    } else {
        runAlways();
    }
}

function runAlways() {
    mlComponent.runScheduled(true, MachineLearning.FrameTiming.Update, MachineLearning.FrameTiming.OnRender);
    mlComponent.onRunningFinished = wrapFunction(mlComponent.onRunningFinished, onMLFinishedProcessingFirstFrame);
}
// on demand functions
function runOnDemand() {
    // By default texture we set on the Output Image is transparent so user can see camera feed. we will swap it out with output of ML when we have it
    script.defaultTexture = script.outputImage.mainPass.baseTex;
    
    mlComponent.onRunningFinished = wrapFunction(mlComponent.onRunningFinished, onMLFinishedProcessing);

    script.createEvent("TapEvent").bind(onTap);
    
    if (script.loader) { script.loader.enabled = false; }
    if (script.photoButton) { script.photoButton.enabled = true; }   
}

function onTap() {
    if (mlComponent.state == MachineLearning.ModelState.Idle) {
        if (!frameProcessed) {
            runOnce();
        }
        else {
            reset();
        }
    }
}

function runOnce() {
    mlComponent.runImmediate(false);

    if (script.loader) { script.loader.enabled = true; }
    if (script.photoButton) { script.photoButton.enabled = false; }

    frameProcessed = true;
}

function onMLFinishedProcessing() {

    setOutputTexture(true);
    if (script.loader) { script.loader.enabled = false; }
    if (script.resetButton) { script.resetButton.enabled = true; }
}

function onMLFinishedProcessingFirstFrame() {
    if (!frameProcessed) {
        setOutputTexture(true);
        if (script.loader) { script.loader.enabled = false; }
        frameProcessed = true;
    }
}

function reset() {

    setOutputTexture(false);

    if (script.photoButton) { script.photoButton.enabled = true; }
    if (script.resetButton) { script.resetButton.enabled = false; }

    frameProcessed = false;
}

function setOutputTexture(fromOutput) {
    if (fromOutput) {
        script.outputImage.mainPass.baseTex = config.output.texture;
    } else {
        script.outputImage.mainPass.baseTex = script.defaultTexture;
    }
}

function checkAllInputSet() {
    if (!script.mlComponent) {
        debugPrint("Error: Please assign an ML Component which has a proxy texture output");
        return false;
    }

    if (!script.outputName) {
        debugPrint("Error: Please provide valid Output Name for ML Component");
        return false;
    }

    if (!script.outputImage) {
        debugPrint("Error: Please assign Output Image to display output texture on");
        return false;
    }

    if (!script.loader) {
        debugPrint("Warning: Loader Object is not set ");
    }
    
    if (!script.photoButton) {
        debugPrint("Warning: Photo Button is not set");
    }
    else {
        script.photoButton.enabled = false;
    }

    if (!script.resetButton) {
        debugPrint("Warning: Reset Button is not set");
    }
    else {
        script.resetButton.enabled = false;
    }
    return true;
}

function debugPrint(text) {
    print("StyleTransferController, " + text);
}

function wrapFunction(origFunc, newFunc) {
    if (!origFunc) {
        return newFunc;
    }
    return function () {
        origFunc();
        newFunc();
    };
}

init();