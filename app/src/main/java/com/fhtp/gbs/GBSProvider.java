package com.fhtp.gbs;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Criteria;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.location.LocationProvider;
import android.os.Handler;
import android.os.SystemClock;
import android.support.v4.app.ActivityCompat;
import android.util.Log;

/**
 * Created by wallacec on 9/6/2017.
 */

public class GBSProvider {
    private final static String TAG = "FakeLocationProvider";
    public final static String FAKE_PROVIDER_NAME = "FakeLocationProvider";

    private int frequency = 500; // milliseconds, how often to generate a new location
    private double stepSize = 0.00002; // degrees, not meters
    private double currentLat = 53.345205; // start point for the route
    private double currentLong = 83.687697;

    private boolean nextStepUp = true; // a flag to change direction: north, east, north, east, etc

    private Handler handler;
    private Runnable timerTask;

    private LocationManager lm;
    private LocationListener ll;
    private Context ctx;

    /**
     * C-r.
     *
     * Creates fake-provider, setups given location manager properly to use it
     * and requests updates for the listener.
     *
     * @param lm location manager to use
     * @param listener location manager to use
     */
    public GBSProvider(LocationManager lm, LocationListener listener, Context ctx) {
        this.lm = lm;
        this.ll = listener;
        this.ctx = ctx;
        try {
            lm.addTestProvider(FAKE_PROVIDER_NAME, false, false,
                    false, false, true, true, true, Criteria.POWER_LOW, Criteria.ACCURACY_FINE);
        } catch (IllegalArgumentException e) {
            Log.w(TAG, "fake provider is already added");
        }
        Log.w(TAG, "done with that");
        lm.setTestProviderEnabled(FAKE_PROVIDER_NAME, true);
        lm.setTestProviderStatus(FAKE_PROVIDER_NAME, LocationProvider.AVAILABLE, null, System.currentTimeMillis());
        lm.requestLocationUpdates(FAKE_PROVIDER_NAME, 0, 0, ll);

        Log.w(TAG, "building handler");
        handler = new Handler();
        Log.w(TAG, "building runnable");
        timerTask = new Runnable() {
            @Override
            public void run() {
                nextLocation();
            }
        };
        Log.d(TAG, "start fake locations");
        nextLocation();
    }

    /**
     * Creates next fake location and sends it to location manager.
     */
    @SuppressLint("NewApi")
    public void nextLocation() {
        Location l = new Location(FAKE_PROVIDER_NAME);
        if (nextStepUp) {
            currentLat += stepSize;
        } else {
            currentLong += stepSize;
        }
        l.setLatitude(currentLat);
        l.setLongitude(currentLong);
        l.setTime(System.currentTimeMillis());
        l.setAltitude(0.0);
        l.setAccuracy(50);
        l.setElapsedRealtimeNanos(SystemClock.elapsedRealtimeNanos());

        nextStepUp = !nextStepUp;

        lm.setTestProviderLocation(FAKE_PROVIDER_NAME, l);
        handler.postDelayed(timerTask, frequency);
    }

    /**
     * Stop it.
     */
    public void stop() {
        handler.removeCallbacks(timerTask);
        lm.removeUpdates(ll);
        lm.removeTestProvider(FAKE_PROVIDER_NAME);
    }
}