'use client';

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';
import * as THREE from 'three';

const GestureEffects = ({ gesture, onRender }) => {
    const mountRef = useRef(null);
    const rendererRef = useRef(null);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const animationFrameRef = useRef(null);
    const particleSystemRef = useRef(null);
    const isAnimatingRef = useRef(false);
    const textureLoaderRef = useRef(null);
    const snowTextureRef = useRef(null);
    const fireTextureRef = useRef(null);
    const [isFadingOut, setIsFadingOut] = useState(false);

    // SVG를 텍스처로 변환하는 함수
    const svgToTexture = useCallback((svgString) => {
        const blob = new Blob([svgString], {
            type: 'image/svg+xml',
        });
        const url = URL.createObjectURL(blob);
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                const canvas =
                    document.createElement('canvas');
                canvas.width = 32;
                canvas.height = 32;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, 32, 32);

                const texture = new THREE.Texture(canvas);
                texture.needsUpdate = true;

                URL.revokeObjectURL(url);
                resolve(texture);
            };
            img.src = url;
        });
    }, []);

    const createSnowEffect = useCallback(() => {
        if (!sceneRef.current || !snowTextureRef.current) {
            console.log(
                '❌ Cannot create snow effect: required references not ready'
            );
            return null;
        }

        console.log('❄️ Creating snow particle effect');

        const particleCount = 500;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(
            particleCount * 3
        );
        const velocities = new Float32Array(
            particleCount * 3
        );

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 15;
            positions[i * 3 + 1] = Math.random() * 15;
            positions[i * 3 + 2] =
                (Math.random() - 0.5) * 15;

            velocities[i * 3] =
                (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 1] = -(
                0.03 +
                Math.random() * 0.02
            );
            velocities[i * 3 + 2] =
                (Math.random() - 0.5) * 0.01;
        }

        particles.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );
        particles.setAttribute(
            'velocity',
            new THREE.BufferAttribute(velocities, 3)
        );

        const material = new THREE.PointsMaterial({
            size: 0.15,
            map: snowTextureRef.current,
            transparent: true,
            opacity: 0.7,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
        });

        const particleSystem = new THREE.Points(
            particles,
            material
        );

        const updateParticles = () => {
            const positions =
                particles.attributes.position.array;
            const velocities =
                particles.attributes.velocity.array;

            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += velocities[i * 3];
                positions[i * 3 + 1] +=
                    velocities[i * 3 + 1];
                positions[i * 3 + 2] +=
                    velocities[i * 3 + 2];

                if (positions[i * 3 + 1] < -5) {
                    positions[i * 3] =
                        (Math.random() - 0.5) * 15;
                    positions[i * 3 + 1] = 15;
                    positions[i * 3 + 2] =
                        (Math.random() - 0.5) * 15;
                }
            }

            particles.attributes.position.needsUpdate = true;
        };

        particleSystem.tick = updateParticles;
        return particleSystem;
    }, []);

    const startAnimation = useCallback(() => {
        if (
            !rendererRef.current ||
            !sceneRef.current ||
            !cameraRef.current
        )
            return;

        console.log('▶️ Starting particle animation');
        isAnimatingRef.current = true;

        const animate = () => {
            if (!isAnimatingRef.current) return;

            if (
                particleSystemRef.current &&
                particleSystemRef.current.tick
            ) {
                particleSystemRef.current.tick();
            }

            rendererRef.current.render(
                sceneRef.current,
                cameraRef.current
            );
            if (onRender) {
                onRender(rendererRef.current.domElement);
            }
            animationFrameRef.current =
                requestAnimationFrame(animate);
        };

        animate();
    }, [onRender]);

    useEffect(() => {
        const addEffect = async () => {
            if (!gesture) {
                // 제스처가 없을 때 파티클 제거
                if (particleSystemRef.current) {
                    console.log('🚫 Removing particle effect');
                    isAnimatingRef.current = false;
                    cancelAnimationFrame(animationFrameRef.current);
                    sceneRef.current.remove(particleSystemRef.current);
                    particleSystemRef.current.geometry.dispose();
                    particleSystemRef.current.material.dispose();
                    particleSystemRef.current = null;
                }
                return;
            }

            // 제스처가 Victory일 경우 눈 효과
            if (
                gesture === 'Victory' &&
                snowTextureRef.current
            ) {
                console.log('❄️ Creating snow effect');
                const snowEffect = createSnowEffect();
                if (snowEffect) {
                    if (particleSystemRef.current) {
                        sceneRef.current.remove(
                            particleSystemRef.current
                        );
                    }
                    sceneRef.current.add(snowEffect);
                    particleSystemRef.current = snowEffect;
                    startAnimation(); // 애니메이션 시작
                }
            }
            // 제스처가 Closed_Fist일 경우 불 효과
            else if (
                gesture === 'Closed_Fist' &&
                fireTextureRef.current
            ) {
                console.log('🔥 Creating fire effect');
                if (particleSystemRef.current) {
                    sceneRef.current.remove(
                        particleSystemRef.current
                    );
                }
                createFireEffect(
                    sceneRef.current,
                    particleSystemRef,
                    fireTextureRef
                );
                startAnimation(); // 애니메이션 시작
            }
        };

        addEffect();
    }, [
        gesture,
        createSnowEffect,
        startAnimation,
        onRender,
    ]);

    useEffect(() => {
        const initWebGL = () => {
            if (!mountRef.current || rendererRef.current)
                return;
            console.log('🎬 Initializing WebGL renderer');

            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance',
                preserveDrawingBuffer: true,
            });

            const scene = new THREE.Scene();
            const containerWidth = mountRef.current.clientWidth;
            const containerHeight = mountRef.current.clientHeight;
            const camera = new THREE.PerspectiveCamera(
                60,
                containerWidth / containerHeight,
                0.1,
                1000
            );

            renderer.setSize(
                containerWidth,
                containerHeight
            );
            renderer.setClearColor(0x000000, 0);
            mountRef.current.appendChild(
                renderer.domElement
            );

            camera.position.z = 3;  

            rendererRef.current = renderer;
            sceneRef.current = scene;
            cameraRef.current = camera;

            const handleResize = () => {
                const width = mountRef.current.clientWidth;
                const height = mountRef.current.clientHeight;
                
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            };

            window.addEventListener('resize', handleResize);
        };

        initWebGL();

        return () => {
            console.log('🧹 Cleaning up WebGL resources');
            isAnimatingRef.current = false;

            if (animationFrameRef.current) {
                console.log('⏹️ Stopping animation');
                cancelAnimationFrame(
                    animationFrameRef.current
                );
            }

            if (particleSystemRef.current) {
                console.log('🗑️ Removing particle system');
                sceneRef.current.remove(
                    particleSystemRef.current
                );
                particleSystemRef.current.geometry.dispose();
                particleSystemRef.current.material.dispose();
                particleSystemRef.current = null;
            }

            if (rendererRef.current) {
                console.log('🧨 Disposing WebGL renderer');
                rendererRef.current.dispose();
                rendererRef.current.forceContextLoss();
                rendererRef.current = null;
            }

            if (mountRef.current?.firstChild) {
                console.log('🔌 Removing canvas element');
                mountRef.current.removeChild(
                    mountRef.current.firstChild
                );
            }
        };
    }, []);

    useEffect(() => {
        const loadTextures = async () => {
            console.log('🎨 Loading SVG textures...');
            try {
                const [snowSvgResponse, fireSvgResponse] =
                    await Promise.all([
                        fetch('/effects/snowflake.svg'),
                        fetch('/effects/fire.svg'),
                    ]);

                const [snowSvg, fireSvg] =
                    await Promise.all([
                        snowSvgResponse.text(),
                        fireSvgResponse.text(),
                    ]);

                const [snowTexture, fireTexture] =
                    await Promise.all([
                        svgToTexture(snowSvg),
                        svgToTexture(fireSvg),
                    ]);

                console.log('❄️ Snow SVG texture loaded');
                snowTextureRef.current = snowTexture;

                console.log('🔥 Fire SVG texture loaded');
                fireTextureRef.current = fireTexture;
            } catch (error) {
                console.error(
                    'Error loading SVG textures:',
                    error
                );
            }
        };

        loadTextures();
    }, [svgToTexture]);

    const createFireEffect = (
        scene,
        particleSystemRef,
        fireTextureRef
    ) => {
        const fireGeometry = new THREE.BufferGeometry();
        const fireCount = 30;  
        const positions = new Float32Array(fireCount * 3);
        const velocities = new Float32Array(fireCount * 4);
        const colors = new Float32Array(fireCount * 4);
        const sizes = new Float32Array(fireCount);
        const lifetimes = new Float32Array(fireCount);

        const generateParticle = (i, isInitial = false) => {
            const radius = Math.random() * 0.3;  
            const theta = Math.random() * Math.PI * 2;
            
            positions[i * 3] = Math.cos(theta) * radius * 0.5;
            positions[i * 3 + 1] = -1.8;  
            positions[i * 3 + 2] = Math.sin(theta) * radius * 0.5;

            velocities[i * 3] = (Math.random() - 0.5) * 0.02;
            velocities[i * 3 + 1] = Math.random() * 0.01 + 0.01;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

            const brightness = Math.random() * 0.2 + 0.8;
            colors[i * 4] = 1.0;
            colors[i * 4 + 1] = 0.6 * brightness;
            colors[i * 4 + 2] = 0.8 * brightness;
            colors[i * 4 + 3] = 0.0;  

            const sizeVariation = Math.random() * 0.12 + 0.08;
            sizes[i] = sizeVariation * (1 + Math.random() * 0.5);
            lifetimes[i] = Math.random() * 3 + 1.5;
        };

        for (let i = 0; i < fireCount; i++) {
            generateParticle(i);
        }

        fireGeometry.setAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );
        fireGeometry.setAttribute(
            'color',
            new THREE.BufferAttribute(colors, 4)
        );
        fireGeometry.setAttribute(
            'size',
            new THREE.BufferAttribute(sizes, 1)
        );

        const fireMaterial = new THREE.ShaderMaterial({
            transparent: true,
            uniforms: {
                time: { value: 0 },
                particleTexture: {
                    value: fireTextureRef.current,
                },
            },
            vertexShader: `
        attribute vec4 color;
        attribute float size;
        varying vec4 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.x += sin(time * 2.0 + position.y) * 0.1;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
            fragmentShader: `
        uniform sampler2D particleTexture;
        varying vec4 vColor;
        
        void main() {
          vec4 texColor = texture2D(particleTexture, gl_PointCoord);
          gl_FragColor = vec4(vColor.rgb, texColor.a * vColor.a);
        }
      `,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const fire = new THREE.Points(
            fireGeometry,
            fireMaterial
        );
        scene.add(fire);
        particleSystemRef.current = fire;

        let time = 0;
        const updateParticles = () => {
            const positions = fireGeometry.attributes.position.array;
            const colors = fireGeometry.attributes.color.array;
            time += 0.016;

            for (let i = 0; i < fireCount; i++) {
                positions[i * 3] += velocities[i * 3];
                positions[i * 3 + 1] += velocities[i * 3 + 1];
                positions[i * 3 + 2] += velocities[i * 3 + 2];

                const horizontalDist = Math.sqrt(
                    positions[i * 3] * positions[i * 3] +
                    positions[i * 3 + 2] * positions[i * 3 + 2]
                );
                
                if (positions[i * 3 + 1] > 2.0 || horizontalDist > 2.5) {
                    generateParticle(i);
                }

                const height = positions[i * 3 + 1];
                if (height < -1.0) {
                    const opacity = Math.min(1.0, (-height - 1.0) * 2);
                    colors[i * 4 + 3] = opacity;
                } else {
                    colors[i * 4 + 3] = 1.0;
                }
            }

            fireGeometry.attributes.position.needsUpdate = true;
            fireGeometry.attributes.color.needsUpdate = true;
        };

        fire.tick = updateParticles;
    };

    return (
        <div
            ref={mountRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10,
            }}
        />
    );
};

export default GestureEffects;
