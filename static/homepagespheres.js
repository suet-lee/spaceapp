// Scene and Camera
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
    var renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        camera.position.set(0, 0, 10);
    var orbit = new THREE.OrbitControls( camera, renderer.domElement )

// Lights
    var light = new THREE.AmbientLight( 0x888888 )
        scene.add( light )
    var light = new THREE.DirectionalLight( 0xfdfcf0, 1 )
      light.position.set(10,10,10)
      scene.add( light )
      
      //Earth
      var earthGeometry = new THREE.SphereGeometry(5, 50,50 );
      var earthMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.ImageUtils.loadTexture("images/earth_texture.jpg"),
        color: 0xaaaaaa,
        specular: 0x333333,
        shininess: 25
      });
      var earth = new THREE.Mesh(earthGeometry, earthMaterial);
      scene.add(earth);
      ///////////////////////////
      /// RENDERING/ANIM LOOP ///
      ///////////////////////////

      //Cloud Geomtry and Material
      var cloudGeometry = new THREE.SphereGeometry(5.1,  50, 50);
      var cloudMaterial = new THREE.MeshPhongMaterial({
        map: new THREE.ImageUtils.loadTexture("images/clouds_2.jpg"),
        transparent: true,
        opacity: 0.1
});

//Create a cloud mesh and add it to the scene.
var clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(clouds);

//Starfield
var starGeometry = new THREE.SphereGeometry(1000, 50, 50);
var starMaterial = new THREE.MeshPhongMaterial({
  map: new THREE.ImageUtils.loadTexture("images/starry_sky_texture.png"),
  side: THREE.DoubleSide,
  shininess: 0
});
var starField = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starField);

var moonGeometry = new THREE.SphereGeometry(3.5, 50,50);
var moonMaterial = new THREE.MeshPhongMaterial({
  map: THREE.ImageUtils.loadTexture("images/moon_texture.jpg")
});
var moon = new THREE.Mesh(moonGeometry, moonMaterial);
moon.position.set(35,0,0);
scene.add(moon);

//Set the moon's orbital radius, start angle, and angle increment value
var r = 35;
var theta = 0;
var dTheta = 2 * Math.PI / 1000;



var render = function() {
  //Rotate the earth about the y-axis
  earth.rotation.y -= .0005;
  clouds.rotation.y -= .00025;

  theta += dTheta;
  moon.position.x = r * Math.cos(theta);
  moon.position.z = r * Math.sin(theta);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};
render();