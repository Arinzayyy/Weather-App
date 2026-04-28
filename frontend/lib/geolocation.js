// Promise wrapper around navigator.geolocation.
// Resolves with "lat,lon" — the exact shape our backend (and OWM) accepts.
// Gives user-friendly messages for the three failure modes so Step 8's
// error handling has clean copy to display.
export function getBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by this browser.'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // 4 decimal places ~ 11 meters precision, plenty for weather
        resolve(latitude.toFixed(4) + ',' + longitude.toFixed(4));
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(new Error('Location permission denied. Please enter a location manually.'));
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          reject(new Error('Your location is currently unavailable. Please enter a location manually.'));
        } else if (err.code === err.TIMEOUT) {
          reject(new Error('Getting your location took too long. Please try again.'));
        } else {
          reject(new Error('Unable to determine your location.'));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  });
}
