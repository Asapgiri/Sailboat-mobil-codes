<script setup lang="ts">
import "./assets/login.css";
import { repo } from './abstract/repository'


type Country = {
  name: string;
  dial_code: string;
  code: string;
};

type TelLogin = {
  country: string;
  number: string;
  remember: boolean;
};

var timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var countries: Country[];
var zo: any;
var login: TelLogin = {
  country: "",
  number: "",
  remember: true,
};

const getJSON = function(url: string, callback: Function) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, JSON.parse(xhr.responseText));
      } else {
        callback(status, JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
};

getJSON(
  "https://raw.githubusercontent.com/moment/moment-timezone/develop/data/meta/latest.json",
  (status: any, data: Country[]) => {
    zo = data;
    getJSON(
      "https://gist.githubusercontent.com/anubhavshrimal/75f6183458db8c453306f93521e93d37/raw/f77e7598a8503f1f70528ae1cbf9f66755698a16/CountryCodes.json",
      (status: any, data: Country[]) => {
        countries = data.sort();
        countries.forEach((country) => {
          if (country.code == zo.zones[timezone].countries[0]) {
            login.country = country.dial_code;
          }
        });
      }
    );
  }
);

function login_w_phone() {
  repo.login.phone(login.country + login.number)
}

function login_w_google() {
  repo.login.google()
  .then(() => window.location.href = '/')
  .catch(alert)
}

</script>

<script lang="ts"></script>

<template>
  <section>
    <div class="container py-5 h-100">
      <div class="row d-flex align-items-center justify-content-center h-100">
        <div class="col-md-8 col-lg-7 col-xl-6">
          <img src="phone.svg" class="img-fluid" alt="Phone image" />
        </div>

        <div class="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
          <form>
            <div class="input-group mb-3">
              <select
                class="form-select input-group-prepend w-25"
                v-model="login.country"
              >
                <option
                  v-for="country in countries"
                  :selected="country.code == zo.zones[timezone].countries[0]"
                  :value="country.dial_code"
                >
                  {{ country.code + " " + country.dial_code }}
                </option>
              </select>
              <input
                type="tel"
                id="form1Example13"
                class="form-control form-control-lg w-75"
                placeholder="Phone number"
                v-model="login.number"
              />
            </div>

            <div class="d-flex justify-content-around align-items-center mb-4">
              <!-- Checkbox -->
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  id="form1Example3"
                  checked
                  v-model="login.remember"
                />
                <label class="form-check-label" for="form1Example3">
                  Remember me
                </label>
              </div>
              <a href="#!">Forgot password?</a>
            </div>

            <!--
            <div ref={ref => this.recaptchaWrapperRef = ref}>
              <div id="recaptcha-container"></div>
            </div>
            -->

            <!-- Submit button -->
            <button
              class="btn btn-primary btn-lg btn-block d-flex justify-content-center w-100"
              type="button"
              :onClick="login_w_phone"
              id="get-sign-in-code"
            >
              Sign in
            </button>

            <div class="divider d-flex align-items-center my-4">
              <p class="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
            </div>

            <button
              class="btn btn-primary btn-lg btn-block d-flex justify-content-center w-100"
              style="background-color: #dd4b39"
              type="button"
              :onClick="login_w_google"
            >
              Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>
