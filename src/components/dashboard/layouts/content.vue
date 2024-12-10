<script setup>
import { ref, defineProps, watch, onMounted, computed } from "vue";
import Alert from "../elements/Alert.vue";
import WordpressService from "@/service/WordpressService";
import AgencyDetailModal from "../elements/AgencyDetailModal.vue";
import SiteSettings from "@/views/SiteSettings.vue";
import { useStore } from "@/stores/store";
import { useForm } from "vee-validate";
import Loader from "@/components/common/Loader.vue";
import { useRouter } from "vue-router";


const router = useRouter();
const allErrors = ref({});

const props = defineProps({
  dashboardData: Object,
  error: String,
  loading: Boolean,
  resendLink: Function,
});

const categories = ref([]);
const allDashboardData = ref();
const showModal = ref(false);
const deatilModalShow = ref(false);
const store = useStore();
const values = ref({
  type: "",
});
const planDetail = ref({
  price: "",
  gst:"",
  total:"",
  razorPayId: "",
  id:""
});

const plans = ref();
const isYearly = ref(false);
const errorMessage = ref("");
const planLoading = ref(false);
allErrors;
watch(
  () => props.dashboardData,
  (newDashboardData, OldDashboardData) => {
    allDashboardData.value = props.dashboardData;
    console.log('aaa',allDashboardData)
  },
  {
    deep: true,
  }
);

onMounted(() => {
  fetchPlans();
  allDashboardData.value = props.dashboardData;
  allErrors.value = {};
});

const openModalWithCategories = async () => {
  try {
    const response = await WordpressService.getCategoryOption();
    if (response.status === 200 && response.data.success) {
      categories.value = response.data.categories;
    }
    console.log(showModal.value);
  } catch (error) {
    console.error(error);
  }
};
const planDetailModalShow = ref(false);

const hidePlanDeatilModal = () => {
  planDetailModalShow.value = false;
  // feedbackValues.value = {};
};
const initiatePayment = (plan) => {
  planDetailModalShow.value = true
  const amount = Number(plan.price);
  const gst = amount * 0.18;
  const totalPrice = amount + gst;
  planDetail.value.price = amount;
  planDetail.value.gst = gst;
  planDetail.value.total = totalPrice;
  planDetail.value.razorPayId = plan.razor_id
  planDetail.value.id = plan.id

}

const filteredPlans = computed(() => {
  return plans.value.filter(plan => plan.type === (isYearly.value ? 'yearly' : 'monthly'));
});
const updateSite = (website_id) => {
  store.updateWebsiteId(website_id);
  deatilModalShow.value = true;
};

const formattedDate = (stringDate) => {
  const date = new Date(stringDate);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const calculateDaysDifference = (stringDate) => {
  let currentDate = new Date();
  let targetDate = new Date(stringDate);
  const oneDay = 24 * 60 * 60 * 1000;
  const diffMilliseconds = Math.abs(currentDate - targetDate);
  return 15 - Math.round(diffMilliseconds / oneDay);
};

const emptyForm = () => {
  values.value.type = "";
  values.value.message = "";
  values.value.title = "";
};

const naviagte = (path)=>{
  router.push(path);
}

const handleSubmission = async (responseh, plan_id) => {
  try {
    
    responseh.plan_id = plan_id; 
    responseh.user_id = allDashboardData.value?.user.id; 
    responseh.agency_id = allDashboardData.value?.user.agency_id; 
    responseh.website_id = allDashboardData.value?.user.agency.agency_websites[0].website_detail.id; 
    console.log("Updated response:", responseh);

    const response = await WordpressService.subscriptionPayment(responseh);
    if (response.status === 200 && response.data.success) {
      console.log("Payment submitted successfully.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const submitPlayment = async(oderId, plan_id) => {
  let userData = allDashboardData.value?.user
  console.log(userData)
  const options = {
    "key": "rzp_test_3kOO5za17PvQpv",
    "name": userData.name,
    'order_id': oderId,
    "description": "Payment",
    "handler": function (response){
      handleSubmission(response, plan_id);
    },
    "prefill": {
      "name": userData.name,
      "email": userData.email,
      "contact": userData.phone == "Na"?  "":  userData?.phone
    },
    "notes": {
      "address": allDashboardData.value?.agency?.address,
      "order_id": 'subscriptionId' 
    },
    "theme": {
      "color": "#F37254"
    }
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
};

const createOrder = async(palnRazorId) => {
  try {
    console.log('ppppp',palnRazorId)
    planLoading.value = true
    const response = await WordpressService.Payment.createOrder({
      plan_id: palnRazorId
    });
    if (response.status === 200 ) {
     await submitPlayment(response.data.order_id, palnRazorId)
    }
    // await submitPlayment('order_OkhSuNKhU3qxd7') 
  } catch (error) {
    console.error("Error:", error);
  } 
  planLoading.value = false
  planDetailModalShow.value = false

};

const fetchPlans = async (paymentId) => {
  try {
    const response = await WordpressService.Payment.fetchPlans()
    // if (response.status === 200 && response.data.success) {
    plans.value = response.data?.plans
    // }
  } catch (error) {
    console.error("Error:", error);
  }
};

</script> 
<template>
  <Loader v-if="loading" />
  <section v-else id="content-wrapper main-content side-content">
    <div class="side-app">
      <div class="" style="margin-left: 18%" v-if="dashboardData.notification">
        <Alert
          :notification="dashboardData.notification"
          :resendLink="resendLink"
        />
      </div>
      <div v-else class="main-container container">
        <div id="wrapper" :class="loading ? 'fade' : ''">
          <section
            v-if="dashboardData?.agency_website_info?.length >= 1 && dashboardData.user.user_type != 'developer'"
            class="speedy-subscription bg-white"
          >
            <div class="container">
      <!-- <div class="row">
                <div class="col-lg-12">
                  <div class="speedy-subscription-wrapper">
                    <div class="subscription-text-side">
                      <h3 class="subscription-heading">
                        
                        {{
                          calculateDaysDifference(
                            dashboardData.agency_website_info[0].created_at
                          ) <= 0 ? "Congratulations! We're increasing your free usage limit 🚀" :`Only days ${calculateDaysDifference(
                            dashboardData.agency_website_info[0].created_at
                          )} left in your free trial! ⏳ Upgrade now for seamless website creation`
                        }}
                      </h3>
                    </div>
                    <div class="subscription-form-side">
                      <a class="subscription-btn" style="cursor: pointer" id="rzp-button1"><i class="fa fa-paypal"></i> Payment
                      </a>
                    </div>
                  </div>
                </div>
              </div> -->
              <div v-if="dashboardData?.user?.current_plans?.length > 0" class="row">
                <div class="col-lg-12">
                  <div class="speedy-subscription-wrapper">
                    <div class="subscription-text-side">
                      <h3 class="subscription-heading">
                       Cureent Plann: {{ dashboardData.user.current_plans[0].plan.name }}

                        
<!--                         
                        {{
                          calculateDaysDifference(
                            dashboardData.agency_website_info[0].created_at
                          ) <= 0 ? "Congratulations! We're increasing your free usage limit 🚀" :`Only days ${calculateDaysDifference(
                            dashboardData.agency_website_info[0].created_at
                          )} left in your free trial! ⏳ Upgrade now for seamless website creation`
                        }} -->
                      </h3>
                      
                    </div>
                    <div class="subscription-text-side">
                      <h3 class="subscription-heading">

                        {{ dashboardData.user.current_plans[0].planexpired > 0? `Exppiring in  ${dashboardData.user.current_plans[0].planexpired} Day`: 'Expired' }}

                      </h3>
                      
                      <p></p>
                    </div>
                    <div v-if="dashboardData.user.current_plans[0].planexpired < 1" class="subscription-form-side">
                      <a class="subscription-btn" style="cursor: pointer" @click="naviagte('/plans')"> Buy Plan
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            
              <!-- <div class="row">
      <div class="col-lg-6" v-for="plan in filteredPlans" :key="plan.id">
        <div class="speedy-subscription-wrapper">
          <div class="subscription-text-side">
            <h3 class="subscription-heading">
              {{ plan.name }}
            </h3>
            <p>{{ plan.description }}</p>
            <p>{{ plan.price }} INR</p>
          </div>
          <div class="subscription-form-side">
            <a
              class="subscription-btn"
              style="cursor: pointer"
              @click="initiatePayment(plan)"
            >
              <i class="fa fa-paypal"></i> Payment
            </a>
          </div>
        </div>
      </div>
    </div> -->
            </div>
        
          </section>
          <!-- <label>
      <input type="checkbox" v-model="isYearly"  class="me-1"/>
      <span> {{ isYearly ? 'Yearly' : 'Monthly' }} Plans</span>
    </label> -->
    <!-- <template v-if="filteredPlans.length > 0">
        <section  v-for="plan in filteredPlans" :key="plan.id" class="speedy-subscription bg-white" style="width: 55%"
>
          <div class="container">

                <div class="col-lg-12">
                  <div class="speedy-subscription-wrapper">
                    <div class="subscription-text-side">
                      <h3 class="subscription-heading">
                        {{ plan.name }}
                      </h3>
                      <p>{{ plan.description }}</p>
                      <p>{{ plan.price }} INR</p>
                    </div>
                    <div class="subscription-form-side">
                      <a class="subscription-btn" style="cursor: pointer" @click="initiatePayment(plan)"><i class="fa fa-paypal"></i> Payment
                      </a>
                    </div>
                  </div>
                </div>

            </div>

            </section>
          </template> -->
          <!-- <section v-else  class="speedy-subscription bg-white" >
          <div class="container">
            <div class="col-lg-12">
              <div class="no-plans-wrapper">
                <h3>No {{ isYearly ? 'Yearly' : 'Monthly' }} Plans Available</h3>
                <p>Please check back later.</p>
              </div>
            </div>
          </div>
        </section> -->

          <div class="page-header">
            <ol class="breadcrumb">
              <!-- breadcrumb -->
              <li class="breadcrumb-item">
                <h3>
                  <i class="fa fa-cubes" aria-hidden="true"></i> Welcome To
                  Dashboard
                </h3>
              </li>
            </ol>
            <!-- End breadcrumb -->
            <div
              class="ms-auto"
              v-if="
                dashboardData?.agency_website_info?.length < 1 ||
                !dashboardData?.agency_website_info ||
                dashboardData.user.user_type === 'developer'
              "
            >
              <div>
                <button
                  class="btnclickable-element Button"
                  data-bs-toggle="modal"
                  data-bs-target="#basicModal"
                  @click="openModalWithCategories"
                >
                  Create a website <i class="fa fa-plus-circle"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="section-wrapper"></div>
          <div
            class="card-wrappers card-info"
            v-if="
              dashboardData?.agency_website_info.length > 0 &&
              !dashboardData?.agency_website_info[0].website_id
            "
          >
            <div class="card">
              <div
                class="card-primary"
                aria-hidden="true"
                data-toggle="modal"
                data-target="#exampleModalRight"
              >
                <div class="valign">
                  <h5>
                    <i class="fa fa-info-circle"></i>
                    <br />
                  </h5>
                </div>
              </div>
              <div class="card-content">
                <div class="form-content">
                  <p class="text-info message">
                    We're currently experiencing a high volume of requests. Your
                    site will be automatically created based on your
                    requirements. Please check back later. Thank you for your
                    patience.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="card-wrappers">
            <div
              v-for="(dash, index) in dashboardData.agency_website_info"
              :key="index"
            >
              <div
                v-if="dash.website_id"
                class="card"
                aria-hidden="true"
                data-toggle="modal"
                data-target="#exampleModalRight"
                @click="updateSite(dash.website_id)"
              >
                <div
                  class="card-primary"
                  aria-hidden="true"
                  data-toggle="modal"
                  data-target="#exampleModalRight"
                >
                  <div class="valign">
                    <h5>
                      <span class="cards-icons"
                        >{{ dash.business_name.charAt(0).toUpperCase() }}
                      </span>
                      <br />
                    </h5>
                  </div>
                </div>
                <div class="card-content">
                  <div class="form-content">
                    <form class="text-start mb-2 mt-3">
                      <div class="form-field mb-4">
                        <h4 class="form-label text-dark">
                          {{
                            dash.business_name.replace(/\b\w/g, (char) =>
                              char.toUpperCase()
                            )
                          }}
                        </h4>
                        <div class="input-group mb-3">
                          <p class="website-links">
                            {{ dash.website_detail.website_domain }}
                          </p>
                        </div>
                        <p class="text-muted">
                          Created at
                          {{ formattedDate(dash.created_at) }}
                        </p>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>

            <div
              class="ag-courses_item"
              aria-hidden="true"
              data-bs-toggle="modal"
              data-bs-target="#basicModal"
              @click="openModalWithCategories"
              v-if="
                dashboardData?.agency_website_info?.length < 1 ||
                !dashboardData?.agency_website_info ||
                dashboardData.user.user_type === 'developer'
              "
            >
              <a href="#" class="ag-courses-item_link">
                <div class="ag-courses-item_bg"></div>

                <div class="ag-courses-item_title">Create a website</div>

                <div class="ag-courses-item_date-box">
                  <span class="ag-courses-item_date">
                    <i class="fa fa-plus-circle"></i>
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <div v-if="planDetailModalShow" class="modal-backdrop fade show"></div>
<div
    class="modal feedback-model fade"
    id="modalContactForm"
    tabindex="-1"
    role="dialog"
    aria-labelledby="Feedback SpeedySites"
    aria-hidden="true"
    :class="{ show: planDetailModalShow, 'd-block': planDetailModalShow }"
  >
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header" style="border: 0">
          <button
            type="button"
            class="btn-close"
            @click="hidePlanDeatilModal"
            aria-hidden="true"
          ></button>
        </div>
        <div class="modal-body mx-3">
          <div class="card-layout layout-medium">
            <div class="content">
              <div class="close-button"></div>

              <h1 class="title">Plan Detail</h1>
              <p data-error="wrong" data-success="right" for="form34"
                >Amount : {{ planDetail.price }}</p
              >
              <p data-error="wrong" data-success="right" for="form34"
                >GST(18%) : {{ planDetail.gst }}</p
              >
              <p data-error="wrong" data-success="right" for="form34"
                >Total Amount : {{ planDetail.total }}</p
              >
             
              <div class="user-actions">
                <div v-if="planLoading" class="three-body3">
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                  <div class="three-body__dot1"></div>
                </div>
                <button class="feedback-btn-primary" @click="createOrder(planDetail.id)">
                  Send
                </button>

                <button
                  class="feedback-btn-outline"
                  data-dismiss="modal"
                  aria-hidden="true"
                  :disabled=planLoading
                  @click="hidePlanDeatilModal"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <SiteSettings />
  <AgencyDetailModal
    :showModal="showModal"
    :categories="categories"
    @hide-modal="showModal = false"
    :dashboardData="dashboardData"
  />
</template>
<style>
.spinner-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
}
</style>



