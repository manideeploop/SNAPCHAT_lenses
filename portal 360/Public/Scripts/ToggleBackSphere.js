// @input SceneObject Camera
// @input float collideDistance = 50
// @input SceneObject CubeCollider
// @input SceneObject backSphere
// @input SceneObject doorOccluders
// @input SceneObject box
// @input Component.AudioComponent audio

self.audio.fadeInTime = 2;
self.audio.fadeOutTime = 2;
self.audio.volume = 1;
	

var objA = script.Camera.getTransform().getWorldPosition();
var objB = script.CubeCollider.getTransform().getWorldPosition();
var distance = Math.abs( objA.distance(objB));
if( distance <= script.collideDistance ) {
	script.box.enabled = false;
	script.backSphere.enabled = false;
    if( self.audio.isPlaying)
		{
			
		}
		else
		{
			script.audio.stop(true);
		}
}
else
{
	script.backSphere.enabled = true;
	script.box.enabled = false;
	if( self.audio.isPlaying)
		{
			script.audio.play(-1);
		}
		else
		{
			
		}
}