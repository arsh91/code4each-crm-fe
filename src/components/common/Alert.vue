<script setup>
import { ref, reactive, defineProps, watch, computed } from "vue";
const props = defineProps({
  notification: String,
  resendLink: Function,
});

const clickCount = ref(0);
const isButtonDisabled = ref(false);
const clickLimitReached = ref(false);
const clickLimit = 1;
const maxClickLimit = 2;
const countdown = ref(0);

const buttonLabel = computed(() => {
  if (isButtonDisabled.value) {
    return `Retry in ${countdown.value} seconds`;
  } else {
    return "Resend Verification Email";
  }
});

const startCountdown = () => {
  countdown.value = 300; // Set the initial countdown time (2 seconds)
  const timer = setInterval(() => {
    countdown.value--;
    if (countdown.value === 0) {
      clearInterval(timer);
      if (clickCount.value < maxClickLimit) {
        isButtonDisabled.value = false;
      }
    }
  }, 1000); // Update countdown every second
};

const handleResendClick = async () => {
  if (!isButtonDisabled.value) {
    clickCount.value++;
    if (clickCount.value >= clickLimit) {
      isButtonDisabled.value = true;
      clickLimitReached.value = true;
      startCountdown();
    }
    try {
      await props.resendLink();
    } catch (error) {
      console.error("Error occurred while resending link in sub-child", error);
    }
  }
};

const remainingTime = computed(() => {
  return countdown.value;
});
</script>
<template>
  <div class="alert-msg m-4">
    <div class="alert alert-warning alert-dismissible fade show">
      <h4 class="alert-heading">
        <i class="fa fa-exclamation-triangle" style="color: #000"></i> Email
        Verification Alert
      </h4>
      <p>
        Welcome to our platform! To unlock all features and secure your account,
        please verify your email. Check your inbox for a verification link.
        Thank you for choosing us! . If you not receive the verification link on
        your email please click the Button Below To Get link.
      </p>
      <hr />
      <a
        href="#"
        @click="handleResendClick"
        class="btn btn-warning"
        :disabled="isButtonDisabled"
        >{{ buttonLabel }}</a
      >
      <!-- <p v-if="clickLimitReached" >You've reached the click limit. Retry in {{ remainingTime }} seconds.</p> -->
      <p v-if="clickLimitReached">You've reached the click limit.</p>
    </div>
  </div>
</template>
<style>
.alert-msg.m-4 {
  display: flex;
  justify-content: center;
  width: 95%;
  /* overflow: ; */
}
a.btn.btn-success {
  line-height: 25px;
  margin: 20px 0px 10px;
  padding: 10px 15px;
  background-color: #0c6c6a;
  border-color: #0c6c6a;
  color: #fff;
}
.alert.alert-success {
  width: 100%;
  text-align: center;
  display: block;
  background: transparent !important;
  border-color: #badbcc;
  margin-bottom: 0rem;
}
h4.alert-heading {
  color: #000;
  font-size: 25px;
  font-weight: 600;
}

.alert-danger p {
  color: #000;
  font-size: 17px;
}

a.btn.btn-warning {
  border: 1px solid #070706;
  background-color: ffd34e;
  font-weight: 200;
}

a.btn.btn-warning:hover {
  color: #ffc107;
  background-color: #101010;
  border-color: #101010;
}
</style>