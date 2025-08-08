package com.expensemanagerrn

import android.os.Build
import com.facebook.react.bridge.*
import com.expensemanagerrn.BuildConfig

class DeviceInfoModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DeviceInfoNative"

    @ReactMethod
    fun getDeviceInfo(promise: Promise) {
        try {
            val map = WritableNativeMap().apply {
                putString("versionName", BuildConfig.VERSION_NAME)
                putInt("versionCode", BuildConfig.VERSION_CODE)
                putString("osVersion", Build.VERSION.RELEASE)
                putString("deviceModel", Build.MODEL)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERROR_GETTING_INFO", e)
        }
    }
}
