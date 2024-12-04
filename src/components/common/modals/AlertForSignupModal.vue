<template>
  <div v-if="alertShowModal" class="modal-backdrop fade show"></div>
  <div
    class="modal try-free alert-try-free-modal"
    id="exampleModaltry"
    tabindex="-1"
    role="dialog"
    :class="{ show: alertShowModal, 'd-block': alertShowModal }"
    ref="alertRef"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <div class="subscription-wrapper">
            <div class="subscription-text-side">
              <h3 class="subscription-heading">
                Hey! We've noticed you've been exploring our website for the
                last 15 seconds. Guess what our average website creation time is
                5 seconds. Your business will be online in this time period.
                Ready to take your online presence to new heights?
              </h3>
            </div>
            <div class="subscription-form-side">
              <a
                class="btn btn-lg button-trial rounded-pill hover-top"
                @click="emits('showAnotherModal', 'signup')"              
                 >TRY FOR FREE
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import {
  ref,
  defineProps,
  onMounted,
  defineEmits
} from "vue";

const emits = defineEmits();
const props = defineProps({
  alertShowModal: {
      type:Boolean,
      default:false
    }
});
const alertRef = ref(null);

const handleOutsideClick = (event) => {
  if (props.alertShowModal && event.target === alertRef.value) {
    emits('closeModal')

  }
};

onMounted(async () => {
  document.body.addEventListener("click", handleOutsideClick);
});

</script>
<style scoped>
.alert-try-free-modal h3.subscription-heading {
  font-size: 18px !important;
  line-height: 28px;
  font-weight: normal;
  letter-spacing: 0 !important;
}
.alert-try-free-modal .subscription-text-side {
  width: 85%;
}

.buttons-design h5 {
  color: #df3650;
  text-align: left;
  font-size: 20px;
  padding: 15px 0;
}

.buttons-design {
  display: block;
}
</style>