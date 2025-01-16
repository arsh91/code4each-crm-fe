<script setup>
import { ref, defineProps, computed, defineEmits, onMounted, inject, watch } from "vue";
import WordpressService from "@/service/WordpressService";
import config from "/config";

const selectedOptionTemplate = ref("");
const templates = ref([]);
const WebsiteCategories = ref([]);
const selectedCategories = ref([]);
const selectedTemplateId = ref(null);
const currentStep = ref(1);

const props = defineProps({
  modalTitle: String,
  modalText: String,
  confirmText: String,
  nextText: String,
  previousText: String,
  optionTitle: String
});
const emits = defineEmits();
const confirmSubmit = () => {
  emits("confirm", selectedTemplateId.value);
};

const prevStep = () => {
  if (selectedOptionTemplate.value === 'randomlySelectTemplate' && currentStep.value == 3) {
    currentStep.value = 1;
  } else {
    currentStep.value--;
  }
};

const nextStep = () => {
  if (currentStep.value === 1) {
    if (selectedOptionTemplate.value === 'randomlySelectTemplate') {
      currentStep.value = 3;
    } else if (selectedOptionTemplate.value === 'selectTemplate') {
      currentStep.value = 2;
    }
  } else {
    currentStep.value++;
  }
};

const fetchWebsiteTemplates = async () => {
  try {
    const response = await WordpressService.getWebsiteTemplates();
    console.log("Fetch Website Templates Response:", response);
    if (response && response.data && response.data.website_templates) {
      templates.value = response.data.website_templates;
      console.log("Templates Data:", templates.value);
    } else {
      console.log("No website templates found or unexpected response structure");
    }
  } catch (error) {
    console.error("Error fetching website templates:", error);
  }
};

const fetchCategories = async () => {
  try {
    const response = await WordpressService.getCategoryOption();
    console.log("Fetch Categories Response:", response);

    if (response && response.data && response.data.categories) {
      WebsiteCategories.value = response.data.categories;
      console.log("Website Categories Data:", WebsiteCategories.value);
    } else {
      console.log("No website Categories found or unexpected response structure");
    }
  } catch (error) {
    console.error("Error fetching website categories:", error);
  }
};

const filteredTemplates = computed(() => {
  if (selectedCategories.value.includes('all')) {
    return templates.value; 
  }
  const uniqueTemplates = new Set();
  templates.value.forEach(template => {
    const templateCategories = template.category_id.split(',').map(cat => cat.trim().toLowerCase());

    if (selectedCategories.value.some(selectedCategory => templateCategories.includes(selectedCategory.toLowerCase()))) {
      uniqueTemplates.add(template);
    }
  });
  return Array.from(uniqueTemplates);
});

const toggleCategory = (category) => {
  if (category === 'all') {
    selectedCategories.value = ['all'];
  } else {
    selectedCategories.value = selectedCategories.value.filter(cat => cat !== 'all');
    if (selectedCategories.value.includes(category)) {
      selectedCategories.value = selectedCategories.value.filter(cat => cat !== category);
    } else {
      selectedCategories.value.push(category);
    }
  }
};

const selectTemplate = (templateId) => {
  selectedTemplateId.value = templateId; 
};

onMounted(() => {
  selectedCategories.value = ["all"];
  fetchWebsiteTemplates();
  fetchCategories();
});
</script>

<template>
  <div
    class="modal model-regin fade"
    id="selectOptionForRegenerate"
    tabindex="-1"
    role="dialog"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog" id="create-popup" role="document" :class="{ 'custom-style': selectedOptionTemplate == 'selectTemplate' && currentStep == 2}">
      <div class="modal-content1">
        <div class="modal-header">
          <button
            type="button"
            class="btn-close"
            data-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>

        <div v-if="currentStep === 1" class="step step-1">
          <div class="mb-3">
            <h3 id="chooseOption">{{ props.optionTitle }}</h3>
            <div class="templateSelect d-flex align-items-center">
              <label class="checkbox-button">
                <input
                  type="radio"
                  :value="'selectTemplate'"
                  v-model="selectedOptionTemplate"
                />
                <span
                  class="btn btn-primary submitTemplate"
                  :class="{ active: selectedOptionTemplate === 'selectTemplate' }"
                >
                  Select Template
                </span>
              </label>
              <br />
              <label class="checkbox-button">
                <input
                  type="radio"
                  :value="'randomlySelectTemplate'"
                  v-model="selectedOptionTemplate"
                />
                <span
                  class="btn btn-primary submitTemplate"
                  :class="{ active: selectedOptionTemplate === 'randomlySelectTemplate' }"
                >
                  Randomly Select Template
                </span>
              </label>
            </div>
              <button
                type="button"
                class="btn btn-primary next-step"
                @click="nextStep"
              >
                {{ props.nextText }}
              </button>
          </div>
        </div>

        <div v-if="currentStep === 2" class="step step-2">
          <div class="mb-3 allTemplates">
            <h3 id="chooseOption">Start Selecting a Template</h3>
            <div class="tabs-design">
              <ul class="nav nav-pills mb-3 border-bottom border-2" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link text-primary fw-semibold"
                    :class="{ active: selectedCategories.length === 1 && selectedCategories.includes('all') }"
                    @click="toggleCategory('all')"
                  >
                    All Websites
                  </button>
                </li>
                <li
                  class="nav-item"
                  role="presentation"
                  v-for="(category, index) in WebsiteCategories"
                  :key="index"
                >
                  <button
                    :class="[
                      'nav-link',
                      { active: selectedCategories.includes(category.name.toLowerCase()) }
                    ]"
                    @click="toggleCategory(category.name.toLowerCase())"
                  >
                    {{ category.name }}
                  </button>
                </li>
              </ul>
            </div>
            <div class="tab-content border rounded-3 border-primary p-3 text-danger" id="pills-tabContent">
              <div class="tab-pane fade show active">
                <div class="all-wesbite">
                  <div class="row">
                    <div
                      class="col-lg-4"
                      v-for="(template, index) in filteredTemplates"
                      :key="index"
                    >
                      <div class="card-wrapper">
                        <div class="img-design">
                          <img :src="config.CRM_API_URL + '/storage/' + template.featured_image" />
                        </div>
                        <div class="button-form">
                          <button
                            class="button-design"
                            :class="{ 'btn-selected': selectedTemplateId === template.id }"
                            @click="selectTemplate(template.id)"
                          >
                            {{ selectedTemplateId === template.id ? 'Selected' : 'Select' }}
                          </button>
                          <button class="button-design">Preview</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
              <button
                type="button"
                class="btn btn-primary next-step"
                @click="nextStep"
              >
                {{ props.nextText }}
              </button>
              <button
                type="button"
                class="btn btn-primary prev-step"
                @click="prevStep"
              >
                {{ props.previousText }}
              </button>
          </div>
        </div>
        <div v-if="currentStep === 3" class="step step-3">
            <h3 class="text-center">{{ props.modalTitle }}</h3>

            <img src="/images/question.png" />
            <p class="r3 px-md-5 px-sm-1">{{ props.modalText }}</p>
            <input type="hidden" name="template_id" :value="selectedOptionTemplate === 'selectTemplate' ? selectedTemplateId : ''"/>

              <button
                class="btn btn-primary next-step"
                data-toggle="modal"
                data-dismiss="modal"
                data-target="#Myform-overlay"
                @click="confirmSubmit"
              >
                {{ props.confirmText }}
              </button>
              <button
                type="button"
                class="btn btn-primary prev-step"
                @click="prevStep"
              >
                {{ props.previousText }}
              </button>
          </div>
        </div>
      </div>
    </div>
</template>

