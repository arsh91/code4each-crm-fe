<script setup>
import { defineProps, watch } from "vue";
import { useField } from "vee-validate";

const props = defineProps({
  name: String,
  type: String,
  placeholder: String,
  class: String,
  label: String,
  textarea: Boolean,
  hiddenValue: String,
});

const { value, errorMessage } = useField(() => props.name);
const hiddenValue = props.hiddenValue;

if (hiddenValue !== undefined) {
  value.value = hiddenValue;
}

const handleFileChange = (event) => {
  if (props.type === "file") {
    value.value = event.target.files[0] || null;
  }
};

watch(
  () => props.hiddenValue,
  (newProp, oldProp) => {
    value.value = props.hiddenValue;
  }
);
</script>


<template>
  <label v-if="label" for="" class="form-label">{{ label }}</label>
  <textarea
    v-if="textarea"
    v-model="value"
    :class="class"
    :placeholder="placeholder"
    rows="3"
  ></textarea>
  <input
    v-else-if="type === 'file'"
    :type="type || 'text'"
    :name="name"
    @change="handleFileChange"
    :class="class"
  />
  <input
    v-else
    v-model="value"
    :type="type || 'text'"
    :placeholder="placeholder"
    :class="class"
  />
  <div class="text-danger">{{ errorMessage }}</div>
</template>
