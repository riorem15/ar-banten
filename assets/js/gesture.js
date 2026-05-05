// gesture.js
// Komponen untuk mendeteksi gesture sentuh (pinch, drag)
AFRAME.registerComponent('gesture-detector', {
  schema: {
    element: { default: '' }
  },

  init: function () {
    this.targetElement =
      this.data.element && document.querySelector(this.data.element)
        ? document.querySelector(this.data.element)
        : this.el;

    this.internalState = {
      previousState: null,
    };

    this.emitGestureEvent = this.emitGestureEvent.bind(this);

    this.targetElement.addEventListener('touchstart', this.emitGestureEvent);
    this.targetElement.addEventListener('touchend', this.emitGestureEvent);
    this.targetElement.addEventListener('touchmove', this.emitGestureEvent);
  },

  remove: function () {
    this.targetElement.removeEventListener('touchstart', this.emitGestureEvent);
    this.targetElement.removeEventListener('touchend', this.emitGestureEvent);
    this.targetElement.removeEventListener('touchmove', this.emitGestureEvent);
  },

  emitGestureEvent: function (event) {
    const currentState = this.getTouchState(event);
    const previousState = this.internalState.previousState;

    const gestureContinues =
      previousState &&
      currentState &&
      currentState.touchCount == previousState.touchCount;

    const gestureEnded = previousState && !gestureContinues;
    const gestureStarted = currentState && !gestureContinues;

    if (gestureEnded) {
      const eventName =
        this.getEventPrefix(previousState.touchCount) + 'fingerend';
      this.el.emit(eventName, previousState);
      this.internalState.previousState = null;
    }

    if (gestureStarted) {
      currentState.startTime = performance.now();
      currentState.startPosition = currentState.position;
      currentState.startSpread = currentState.spread;
      const eventName =
        this.getEventPrefix(currentState.touchCount) + 'fingerstart';
      this.el.emit(eventName, currentState);
      this.internalState.previousState = currentState;
    }

    if (gestureContinues) {
      const eventDetail = {
        positionChange: {
          x: currentState.position.x - previousState.position.x,
          y: currentState.position.y - previousState.position.y
        }
      };

      if (currentState.spread) {
        eventDetail.spreadChange = currentState.spread - previousState.spread;
      }

      Object.assign(previousState, currentState);
      Object.assign(eventDetail, previousState);

      const eventName =
        this.getEventPrefix(currentState.touchCount) + 'fingermove';
      this.el.emit(eventName, eventDetail);
    }
  },

  getTouchState: function (event) {
    if (event.touches.length === 0) {
      return null;
    }

    const touchPosition = this.getTouchPosition(event.touches[0]);
    if (event.touches.length === 1) {
      return {
        touchCount: 1,
        position: touchPosition
      };
    }

    const touchPosition2 = this.getTouchPosition(event.touches[1]);
    const spread = this.getDistance(touchPosition, touchPosition2);
    
    return {
      touchCount: 2,
      position: {
        x: (touchPosition.x + touchPosition2.x) / 2,
        y: (touchPosition.y + touchPosition2.y) / 2
      },
      spread: spread
    };
  },

  getEventPrefix: function (touchCount) {
    const numberNames = ['one', 'two', 'three', 'four'];
    return numberNames[touchCount - 1];
  },

  getTouchPosition: function (touch) {
    return {
      x: touch.clientX,
      y: touch.clientY
    };
  },

  getDistance: function (a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  }
});

// Komponen untuk merespons gesture pada entitas 3D
AFRAME.registerComponent('gesture-handler', {
  schema: {
    enabled: { default: true },
    rotationFactor: { default: 5 },
    minScale: { default: 0.1 },
    maxScale: { default: 3 }
  },

  init: function () {
    this.handleScale = this.handleScale.bind(this);
    this.handleRotation = this.handleRotation.bind(this);

    this.isVisible = false;
    this.initialScale = this.el.object3D.scale.clone();
    this.scaleFactor = 1;

    this.el.parentNode.addEventListener('targetFound', (e) => {
      this.isVisible = true;
    });

    this.el.parentNode.addEventListener('targetLost', (e) => {
      this.isVisible = false;
    });
  },

  update: function () {
    if (this.data.enabled) {
      this.el.sceneEl.addEventListener('onefingermove', this.handleRotation);
      this.el.sceneEl.addEventListener('twofingermove', this.handleScale);
    } else {
      this.el.sceneEl.removeEventListener('onefingermove', this.handleRotation);
      this.el.sceneEl.removeEventListener('twofingermove', this.handleScale);
    }
  },

  remove: function () {
    this.el.sceneEl.removeEventListener('onefingermove', this.handleRotation);
    this.el.sceneEl.removeEventListener('twofingermove', this.handleScale);
  },

  handleRotation: function (event) {
    if (this.isVisible) {
      // Putar di sumbu Y (kiri-kanan) dan X (atas-bawah)
      this.el.object3D.rotation.y +=
        event.detail.positionChange.x * this.data.rotationFactor * 0.005;
      
      this.el.object3D.rotation.x +=
        event.detail.positionChange.y * this.data.rotationFactor * 0.005;
    }
  },

  handleScale: function (event) {
    if (this.isVisible) {
      this.scaleFactor *=
        1 + event.detail.spreadChange / event.detail.startSpread;

      this.scaleFactor = Math.min(
        Math.max(this.scaleFactor, this.data.minScale),
        this.data.maxScale
      );

      this.el.object3D.scale.x = this.scaleFactor * this.initialScale.x;
      this.el.object3D.scale.y = this.scaleFactor * this.initialScale.y;
      this.el.object3D.scale.z = this.scaleFactor * this.initialScale.z;
    }
  }
});
