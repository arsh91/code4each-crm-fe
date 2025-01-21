<script setup>
import NavBar from "@/components/dashboard/layouts/navbar.vue";
import SideBar from "@/components/dashboard/layouts/sidebar.vue";
import { useAuth } from "@/service/useAuth";
import { useRouter } from "vue-router";
import {
  ref,
  defineProps,
  onMounted,
  provide,
  inject,
  watch,
  computed,
} from "vue";
import WordpressService from "@/service/WordpressService";
import Modal from "@/components/common/Modal.vue";
import Swal from "sweetalert2";
import EditSiteSettingsFormBuilder from "@/components/common/EditSiteSettingsFormBuilder.vue";
import EditSiteSettingsButtonFormBuilder from "@/components/common/EditSiteSettingsButtonFormBuilder.vue";
import { useStore } from "@/stores/store";
import { capitalizeAndReplaceChar } from "@/util/helper";
import config from "/config";
import { openLinkInNewTab } from "@/util/helper";
import { EventBus } from "@/EventBus";
import DeleteModal from "@/components/common/DeleteModal.vue";
import ConfirmModal from "@/components/common/ConfirmModal.vue";
import ConfirmUiModal from "@/components/common/ConfirmUiModal.vue";
import SelectOptionForRegenerate from "@/components/common/SelectOptionForRegenerate.vue";
import ProcessCompleteModal from "@/components/common/ProcessCompleteModal.vue";
import AnimationLoader from "@/components/common/AnimationLoader.vue";
import Loader from "@/components/common/Loader.vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useForm } from "vee-validate";
import * as yup from "yup";
import FlashMessage from "@/components/common/FlashMessage.vue";

const router = useRouter();
const { logout } = useAuth();
const isSidebarToggled = ref(true);
const activeComponentsDetail = ref([]);
const allComponentsDetailAccToType = ref();
const selectedImage = ref();
const store = useStore();
const oldComponentType = ref();
const navBarToggle = (value) => {
  isSidebarToggled.value = value;
};
const storeComponentsPosition = ref([]);
const buttonStates = ref();
const loading = ref(true);
const error = ref(false);
const errors = ref([]);
const dashboardData = ref([]);
const userData = ref([]);
const showModal = ref(false);
const loadingForComonents = ref(true);
const oldComponent = ref();
const newComponent = ref();
const showEditComponentFieldModal = ref(false);
const siteSettingsFormFields = ref([]);
const siteSettingsDeatil = ref();
const menuUnderDelete = ref(null);
const saveComponentPositionBtn = ref(false);
const enabled = ref(true);
const disableDragDrop = ref(true);
const itemDraggingStates = ref({});
const showEditMupltipleImagesModal = ref(false);
const uploadedFiles = ref([]);
const disableImageSubmitButton = ref();
const fileInput = ref(null);
const componentImagesAcctoType = ref();
const selectedComponentPreviewImgSrc = ref();
const btnDisable = ref(false);
const currentTab = ref("image");
const selectedDeletedImageUrl = ref(null);
const newActiveFontId = ref(null);
const templateId = ref(null);
const selectedCategory = ref("");

const defaultUrls = ref();
const modalShow = ref(false);
const submitLoading = ref(false);

const sections = computed(() => [
  { value: "home", label: "home" },
  { value: "about", label: "about" },
  { value: "service", label: "service" },
  { value: "footer", label: "footer" },
]);

const outeritems = ref([
  { id: 1, name: "Header Menu", open: false, value: "header" },
  { id: 2, name: "Footer Menu", open: false, value: "footer" },
]);
const values = ref({
  type: "",
  menu_value_type: "",
});

const eachValues = ref({
  type: "",
  menu_value_type: "",
});

const allErrors = ref({});
const allErrorsEach = ref({});
const confirmDelete = ref(false);

const { alerrors, resetForm, handleSubmit } = useForm();
const dataAPi = ref({});
const showForm = ref(false);

const validationSchema = yup.object({
  type: yup.string().required("Please select a section"),
  name: yup.string().required("Please provide a menu name"),
});

const validationSchemaExternal = yup.object({
  name: yup.string().required("Please provide a menu name"),
  external: yup
    .string()
    .url("Invalid format for external link URL")
    .required("Please provide a external link"),
});

const handleSubmitAddMenu = (id) => {
  values.value.menu_type = id;
  submitAddMenu();
};

const submitAddMenu = handleSubmit(async () => {
  try {
    submitLoading.value = true;
    let data = {};
    let formValues = values.value;
    if (formValues.menu_value_type === "internal") {
      await validationSchema.validate(formValues, { abortEarly: false });
      data.value = formValues.type;
    } else if (formValues.menu_value_type === "external") {
      await validationSchemaExternal.validate(formValues, {
        abortEarly: false,
      });
      data.value = formValues.external;
    }
    data.name = formValues.name;
    data.menu_value_type = formValues.menu_value_type;
    data.menu_type = formValues.menu_type;
    allErrors.value = {};
    const response = await WordpressService.Menus.addMenu({
      website_url: siteSettingsDeatil.value?.website_domain,
      menu_data: data,
    });
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Menus Added sucessfully");
      await fetchDashboardData();
      await getMenus();
      values.value = {
        type: "",
        menu_value_type: "",
      };
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});
    allErrors.value = errors;
  }
  submitLoading.value = false;
});

const editMenu = handleSubmit(async () => {
  try {
    submitLoading.value = true;
    let data = {};
    let formValues = eachValues.value;
    if (formValues.menu_value_type === "internal") {
      await validationSchema.validate(formValues, { abortEarly: false });
      data.value = formValues.type;
    } else if (formValues.menu_value_type === "external") {
      await validationSchemaExternal.validate(formValues, {
        abortEarly: false,
      });
      data.value = formValues.external;
    }
    data.name = formValues.name;
    data.id = formValues.id;
    data.menu_value_type = formValues.menu_value_type;

    allErrorsEach.value = {};
    const response = await WordpressService.Menus.editMenu({
      website_url: siteSettingsDeatil.value?.website_domain,
      menu_data: data,
    });
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Menus Updated sucessfully");
      await fetchDashboardData();
      await getMenus();
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});

    allErrorsEach.value = errors;
  }
  submitLoading.value = false;
});

const showDeletePopup = (id) => {
  menuUnderDelete.value = id;
  confirmDelete.value = true;
};

const hideDeletePopup = () => {
  menuUnderDelete.value = null;
  confirmDelete.value = false;
};

const deleteMenu = async () => {
  try {
    let data = {};
    data.id = menuUnderDelete.value;
    const response = await WordpressService.Menus.deleteMenu({
      website_url: siteSettingsDeatil.value?.website_domain,
      menu_data: data,
    });
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Menus Deleted Sucessfully");
      await fetchDashboardData();
      await getMenus();
    }
  } catch (validationErrors) {
    const errors = validationErrors.inner.reduce((acc, error) => {
      acc[error.path] = error.message;
      return acc;
    }, {});

    allErrorsEach.value = errors;
  }
  hideDeletePopup();
};

const handleChange = async (newList, menu_type) => {
  try {
    let headerItems = dataAPi.value.filter(
      (item) => item.menu_type === menu_type
    );
    headerItems.forEach((item, index) => {
      item.position = index + 1;
    });

    const response = await WordpressService.Menus.changePosition({
      website_url: siteSettingsDeatil.value?.website_domain,
      menu_data: headerItems,
    });
    if (response.status === 200 && response.data.success) {
      store.updateFlashMeassge(true, "Menus Position Changed sucessfully");
      await fetchDashboardData();
      await getMenus();
    }
  } catch (validationErrors) {}
};

const toggleItem = (index, eachVal) => {
  dataAPi.value[index].open = !dataAPi.value[index].open;

  if (dataAPi.value[index].open) {
    (eachValues.value.type = eachVal.value),
      (eachValues.value.menu_value_type = eachVal.menu_value_type),
      (eachValues.value.name = eachVal.name),
      (eachValues.value.external = eachVal.value),
      (eachValues.value.position = eachVal.position),
      (eachValues.value.id = eachVal.id);
  } else {
  }
};

const toggleItemOuter = (index, menu_type) => {
  showForm.value = false;
  outeritems.value[index].open = !outeritems.value[index].open;
  // values.value.menu_type = menu_type;
};

const fetchDashboardData = async () => {
  try {
    const response = await WordpressService.fetchDashboardData();
    if (response.status === 200 && response.data.success) {
      dashboardData.value = response.data;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.error("Authentication failed. Please log in.", error);
      error.value = true;
      localStorage.removeItem("access_token");
      router.push("/login");
    } else {
      console.error("An error occurred:", error.message);
    }
  }
};

const getMenus = async () => {
  try {
    const response = await WordpressService.Menus.getMenus({
      website_url: siteSettingsDeatil.value?.website_domain,
    });

    if (response.status === 200 && response.data.success) {
      let data = response.data.response;
      if (response.data.response.length > 0) {
        const modifiedArray = data.map((item) => {
          return {
            ...item,
            open: false,
          };
        });
        dataAPi.value = modifiedArray;
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const getActiveComponentsData = async () => {
  try {
    const response = await WordpressService.Components.getActiveComponents({
      website_url: siteSettingsDeatil.value?.website_domain,
    });

    if (response.status === 200 && response.data.success) {
      activeComponentsDetail.value = response.data.components_detail;
      let firstActiveComponent = activeComponentsDetail.value[0];
      activeComponentsDetail.value.forEach((image) => {
        activeComponentsDetail.dragging = false;
      });
      buttonStates.value = new Array(activeComponentsDetail.value.length).fill(
        false
      );
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

onMounted(async () => {
  await getSiteDeatils();
  await fetchDashboardData();
  await getActiveComponentsData();
  await getMenus();
  loading.value = false;
});

watch(
  () => store.websiteId,
  async (newWebsiteId, oldWebsiteId) => {
    await getSiteDeatils();
    await fetchDashboardData();
    await getMenus();
    await getActiveComponentsData();

    loading.value = false;
  }
);

provide("dashBoardMethods", {
  fetchDashboardData,
});

const getSiteDeatils = async () => {
  try {
    const response = await WordpressService.WebsiteSettings.getSiteDetail({
      website_id: store.websiteId,
    });
    if (response.status === 200 && response.data.success) {
      siteSettingsDeatil.value = response.data.settings_detail;
      const responseCatName = siteSettingsDeatil.value.agency_website_detail.website_category_name;
      if (responseCatName) {
        selectedCategory.value = responseCatName.trim();
      }
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const regenerateWebsite = async () => {
  templateId.value = id;
  try {
    loading.value = true;
    const response = await WordpressService.regenerateWebsite({
      agency_id: dashboardData.value.user.agency_id,
      website_url: siteSettingsDeatil.value.website_domain,
      template_id: templateId.value,
    });
    await getSiteDeatils();
    await fetchDashboardData();
    await getMenus();
  } catch (error) {
    console.log(error);
    console.error("Error Occur while regenerating website", error);
  }
  loading.value = false;
};
</script>

<template>
  <div class="page">
    <FlashMessage :visible="store.flashMeassge" v-if="store.flashMeassge" />
    <NavBar
      @logout="logout"
      @nav-bar-toggle="navBarToggle"
      :dashboardData="dashboardData?.user"
    ></NavBar>
    <SideBar
      :dashboardData="dashboardData"
      :toggled="isSidebarToggled"
    ></SideBar>
    <section id="content-wrapper main-content side-content">
      <div class="side-app">
        <div class="main-container-components container">
          <div id="wrapper">
            <div
              class="eidtor-site"
              aria-hidden="true"
              data-toggle="modal"
              data-target="#exampleModalRight-components"
            >
              <div
                v-for="(compValue, index) in activeComponentsDetail"
                :key="index"
              >
                <div class="eidtor-img">
                  <img :src="config.CRM_API_URL + compValue.preview" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="right-side">
      <div class="sidebar-right py-3" id="sidebar-right">
        <header
          data-hook="panel-header"
          class="panel-header panel-header-flex theme-standard without-stripe"
        >
          <div class="panel-header-title">
            <span class="panel-header-title-span"> </span>
            <img
              src="/images/export.png"
              @click="openLinkInNewTab(siteSettingsDeatil.website_domain)"
              style="cursor: pointer"
            />
          </div>
        </header>

        <div class="ifYqM">
          <div class="accordion accordion-flush" id="accordionFlushExample">
            <div
              v-for="(item, index) in outeritems"
              :key="item.id"
              class="accordion-item"
            >
              <h2 class="accordion-header" :id="'heading' + item.id">
                <button
                  class="accordion-button"
                  :class="{ collapsed: !item.open }"
                  type="button"
                  @click="toggleItemOuter(index, item.value)"
                  :aria-expanded="item.open ? 'true' : 'false'"
                  :aria-controls="'collapse' + item.id"
                >
                  {{ item.name }}
                </button>
              </h2>
              <div
                :id="'collapse' + item.id"
                class="accordion-collapse collapse"
                :class="{ show: item.open }"
                :aria-labelledby="'heading' + item.id"
                data-bs-parent="#accordionExample"
              >
                <div class="accordion-body">
                  <button
                    type="button"
                    class="accordion-button1"
                    @click="showForm = !showForm"
                  >
                    <i class="fa fa-plus" aria-hidden="true"></i> Add button
                  </button>
                </div>

                <form id="multi-step-form" enctype="multipart/form-data">
                  <div
                    v-if="showForm"
                    class="row row-cols-lg-auto g-3 align-items-center"
                  >
                    <div class="col-12">
                      <label for="businessCategory" class="form-label"
                        >Menu Type*</label
                      >
                      <select
                        class="form-select select-category"
                        id="businessCategory"
                        aria-label="Select an option"
                        v-model="values.menu_value_type"
                      >
                        <option value="">Select Type</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                      <div class="text-danger">
                        {{ allErrors.menu_value_type }}
                      </div>
                    </div>
                    <div v-if="values.menu_value_type" class="col-12">
                      <label for="name" class="form-label">Menu Name*</label>
                      <input
                        type="text"
                        class="form-control"
                        id="name"
                        name="name"
                        v-model="values.name"
                      />
                      <div class="text-danger">
                        {{ allErrors.name }}
                      </div>
                    </div>
                    <div
                      v-if="values.menu_value_type === 'internal'"
                      class="col-12"
                    >
                      <label for="businessCategory" class="form-label"
                        >Section*</label
                      >

                      <select
                        class="form-select select-category"
                        id="businessCategory"
                        aria-label="Select an option"
                        v-model="values.type"
                      >
                        <option value="" selected>Select Section</option>
                        {{
                          sections
                        }}
                        <option
                          v-for="option in sections"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                      <div class="text-danger">{{ allErrors.type }}</div>
                    </div>
                    <div
                      v-if="values.menu_value_type === 'external'"
                      class="col-12"
                    >
                      <label for="businessName" class="form-label"
                        >External Link*</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        v-model="values.external"
                      />
                      <div class="text-danger">
                        {{ allErrors.external }}
                      </div>
                    </div>
                    <div class="col-12">
                      <div class="speedy-wrapper" v-if="submitLoading">
                        <div class="three-body">
                          <div class="three-body__dot"></div>
                          <div class="three-body__dot"></div>
                          <div class="three-body__dot"></div>
                        </div>
                      </div>

                      <button
                        class="btn speedy-btn"
                        type="button"
                        :disabled="!values.menu_value_type"
                        @click="handleSubmitAddMenu(item.value)"
                      >
                        Submit
                      </button>
                    </div>
                    <!-- <button
                      type="button"
                      :disabled="!values.menu_value_type"
                      @click="submitAddMenu()"
                      class="btn btn-primary next-step here-btn mt-2"
                    >
                      Save
                    </button> -->
                  </div>
                </form>
                <VueDraggableNext
                  :list="dataAPi"
                  @end="(itemValue) => handleChange(itemValue, item.value)"
                  class="menus-div"
                >
                  <div v-for="(itemi, index) in dataAPi" :key="itemi.id">
                    <div
                      v-if="itemi.menu_type == item.value"
                      class="accordion-item"
                    >
                      <h2
                        class="accordion-header sub-headingOne"
                        :id="'heading' + itemi.id"
                      >
                        <button
                          class="accordion-button sub-headingOne-btn"
                          :class="{ collapsed: !itemi.open }"
                          type="button"
                          @click="toggleItem(index, itemi)"
                          :aria-expanded="itemi.open ? 'true' : 'false'"
                          :aria-controls="'collapse' + itemi.id"
                        >
                          {{ itemi.name }}
                        </button>
                      </h2>
                      <div
                        :id="'collapse' + itemi.id"
                        class="accordion-collapse collapse"
                        :class="{ show: itemi.open }"
                        :aria-labelledby="'heading' + itemi.id"
                        data-bs-parent="#accordionExample"
                      >
                        <div class="accordion-body">
                          <form
                            class="row row-cols-lg-auto g-3 align-items-center"
                          >
                            <div class="col-12">
                              <label for="businessCategory" class="form-label"
                                >Menu Type*</label
                              >
                              <select
                                class="form-select select-category"
                                id="businessCategory"
                                aria-label="Select an option"
                                v-model="eachValues.menu_value_type"
                              >
                                <option value="">Select Type</option>
                                <option value="internal">Internal</option>
                                <option value="external">External</option>
                              </select>
                              <div class="text-danger">
                                {{ allErrorsEach.menu_value_type }}
                              </div>
                            </div>
                            <div
                              v-if="eachValues.menu_value_type"
                              class="col-12"
                            >
                              <label for="name" class="form-label"
                                >Menu Name*</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                id="name"
                                name="name"
                                v-model="eachValues.name"
                              />
                              <div class="text-danger">
                                {{ allErrorsEach.name }}
                              </div>
                            </div>
                            <div
                              v-if="eachValues.menu_value_type === 'internal'"
                              class="col-12"
                            >
                              <label for="businessCategory" class="form-label"
                                >Section*</label
                              >

                              <select
                                class="form-select select-category"
                                id="businessCategory"
                                aria-label="Select an option"
                                v-model="eachValues.type"
                              >
                                <option value="" selected>
                                  Select Section
                                </option>
                                {{
                                  sections
                                }}
                                <option
                                  v-for="option in sections"
                                  :key="option.value"
                                  :value="option.value"
                                >
                                  {{ option.label }}
                                </option>
                              </select>
                              <div class="text-danger">
                                {{ allErrorsEach.type }}
                              </div>
                            </div>
                            <div
                              v-if="eachValues.menu_value_type === 'external'"
                              class="col-12"
                            >
                              <label for="businessName" class="form-label"
                                >External Link*</label
                              >
                              <input
                                type="text"
                                class="form-control"
                                v-model="eachValues.external"
                              />
                              <div class="text-danger">
                                {{ allErrorsEach.external }}
                              </div>
                            </div>
                            <div class="col-12">
                              <div class="speedy-wrapper" v-if="submitLoading">
                                <div class="three-body loaderDel">
                                  <div class="three-body__dot"></div>
                                  <div class="three-body__dot"></div>
                                  <div class="three-body__dot"></div>
                                </div>
                              </div>
                              <div class="speedy-div">
                                <i
                                  class="fa fa-trash"
                                  aria-hidden="true"
                                  @click="showDeletePopup(itemi.id)"
                                  :disabled="submitLoading"
                                  style="cursor: pointer"
                                ></i>
                                <button
                                  type="button"
                                  class="btn speedy-btn"
                                  :disabled="
                                    !eachValues.menu_value_type || submitLoading
                                  "
                                  @click="editMenu()"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                            <!-- <button
                              type="button"
                              @click="deleteMenu(itemi.id)"
                              class="btn btn-primary next-step here-btn mt-2"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              :disabled="!eachValues.menu_value_type"
                              @click="editMenu()"
                              class="btn btn-primary next-step here-btn mt-2"
                            >
                              <i
                                class="fa fa-plus-circle"
                                aria-hidden="true"
                              ></i>
                              Save
                            </button> -->
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                </VueDraggableNext>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <Loader v-if="loading" />
  <SelectOptionForRegenerate
    v-if="selectedCategory" 
    :initialCategory="selectedCategory"
    optionTitle="Choose an Option"
    previousText="Previous"
    nextText="Next"
    modalTitle="Confirm!"
    modalText="Do you really want to regenrate .This will regenrate your site"
    @confirm="regenerateWebsite"
    confirmText="Submit"
  />
  <ProcessCompleteModal
    modalTitle="Awesome!"
    modalText="Your website Regenerated successfully"
    confirmText="Preview"
    @confirm="openLinkInNewTab(siteSettingsDeatil.website_domain)"
  />

  <ConfirmUiModal
    modalTitle="Confirm!"
    modalText="Do you really want delete this menu?"
    @confirm="deleteMenu"
    @hide="hideDeletePopup"
    confirmText="Submit"
    :showModal="confirmDelete"
  />
</template>
<style>

.button-container {
  position: absolute;
  bottom: 49px;
  right: 488px;
}

.custom-button:hover {
  background-color: rgba(21, 62, 105, 0.2);
  opacity: 1;
}

.testimonial-container {
  display: grid;
  grid-template-columns: repeat(3, auto);
  grid-column-gap: 15px;
}

.testimonial {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  /* width: 300px; */
  margin: 10px 0px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.testimonialImg {
  width: 150px;
  height: 120px;
}
.imageContainer {
  display: inline-block;
  position: relative;
}

.imageContainer::before {
  content: "\2714"; /* Unicode checkmark character */
  position: absolute;
  left: 111%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  color: green;
}
p {
  font-size: 16px;
  line-height: 1.5;
}
.custom-modal-lg {
  max-width: 50%;
}

.flagWiseImg {
  width: 300px;
  border: 2px solid green;
  box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.5);
}

.disabled-image {
  opacity: 0.5; /* Reduce opacity to make it appear disabled */
  pointer-events: none; /* Disable pointer events to prevent interaction */
}

.image-button-drag {
  top: 50%;
  right: 15%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: block;
}

.dragging {
  opacity: 0.7; /* Reduce opacity while dragging */
  border: 2px solid #3498db; /* Add a border */
  border-radius: 4px; /* Round the corners */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3); /* Add a shadow */
}

.dragItem {
  border: 1px dashed red;
  background: red;
  opacity: 0.5;
}
.dropHere {
  border: 5px dashed red;
}

.dragItem {
  background-color: #f1f1f1; /* Background color */
  border: 2px solid #666; /* Border style */
  color: #333; /* Text color */
  cursor: grab; /* Cursor style */
  opacity: 0.7; /* Opacity while dragging */
  transition: all 0.3s; /* Smooth transition */

  /* Additional styles as needed */
}
.dropHere {
  background-color: #e1e1e1; /* Background color */
  border: 2px dashed #666; /* Border style */
  color: #555; /* Text color */
  cursor: pointer; /* Cursor style */

  /* Additional styles as needed */
}

.dragArea {
  cursor: move;
}

.upload_wrapper_inner_img_cont img {
  width: 100%;
}

.upload_wrapper_inner_img_cont {
  position: relative;
}

.upload_wrapper_inner_img_cont .upload__img-close {
  right: -10px;
  top: -10px;
}
.here-btn {
  /* font-family: var(--font_cnikI10_default); */
  font-size: 13px;
  font-weight: 400;
  color: #fff;
  padding: 10px 10px;
  z-index: 3;
  background: #1d2b64;
  border-color: #1d2b64;
  transition: 0.3s;
  border-radius: 8px;
  box-shadow: none;
  border: 1px solid #1d2b64;
}

button.btn.btn-primary.next-step {
  color: #fff;
  /* background-color: #23286e; */
  border-color: #1d2b64;
  padding: 10px 18px;
  /* display: flex; */
  float: inline-end;
  background: #1d2b64;
  border-radius: 8px;
  margin-right: 16px;
}

.loaderDel {
  left: 13%;
}

.menus-div:hover {
  cursor: all-scroll;
}

.sub-headingOne-btn:hover {
  cursor: all-scroll;
}
</style>
