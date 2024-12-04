<script setup >
import { defineProps, ref } from "vue";
import { useField } from "vee-validate";
import { string } from "yup";

const isFocused = ref(false);

const props = defineProps({
  iconClass: String,
  fieldLabel: String,
  fieldName: String,
  type: String,
  disabled: Boolean,
  hiddenValue: String,
});
const { value, errorMessage } = useField(() => props.fieldName);
const hiddenValue = props.hiddenValue;

if (hiddenValue !== undefined) {
  value.value = hiddenValue;
}
</script>
<template>
  <div class="input-div" :class="[isFocused ? 'focus' : '']">
    <div class="i">
      <i class="fa" :class="iconClass"></i>
    </div>
    <div class="div">
      <h5 v-if="!disabled">{{ fieldLabel }}</h5>
      <input
        :type="type || 'text'"
        v-model="value"
        class="input"
        @focus="isFocused = true"
        :disabled="disabled"
      />
      <div class="text-danger input-error">{{ errorMessage }}</div>
    </div>
  </div>
</template>
<style>
.input-error {
  display: flex;
  margin: 30px auto;
  align-items: center;
  justify-content: flex-start;
  padding: 0px 10px;
  text-align: start;
  word-break: break-word;
}
</style>