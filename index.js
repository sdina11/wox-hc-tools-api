import express from "express";

const app = express();
app.use(express.json());

function validMemberId(memberId) {
  return typeof memberId === "string" && /^\d{8}$/.test(memberId);
}

function validDob(dob) {
  if (typeof dob !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return false;
  }

  return !Number.isNaN(Date.parse(`${dob}T00:00:00Z`));
}

function getMemberProfile(memberId, memberDob) {
  if (!validMemberId(memberId)) {
    return { error: "Invalid member ID" };
  }

  if (!validDob(memberDob)) {
    return { error: "Invalid date of birth. Use YYYY-MM-DD." };
  }

  if (memberId === "12345678") {
    return {
      member_id: 12345678,
      first_name: "Jim",
      last_name: "Briggs",
      phone_number: "+13672366712",
      email: "jim_briggs@hotmail.com",
      address: {
        street: "162 2nd St",
        city: "Louisville",
        state: "KY",
        zip_code: "43421"
      },
      claims_list: [
        {
          claim_title: "Claim 1",
          claim_number: "3311",
          date_of_service: "June 9th, 2024",
          status: "declined",
          in_network: false,
          provider: "Lexington Wellness Clinic",
          claim_description:
            "Office visit for general wellness and anti-aging strategies, not related to diagnosis or treatment of a specific medical condition."
        },
        {
          claim_title: "Claim 2",
          claim_number: "1622",
          date_of_service: "January 10, 2024",
          status: "approved",
          in_network: true,
          provider: "UK Imaging Center",
          claim_description:
            "Office visit with a physician, including x-ray imaging to assess a bone or joint condition."
        },
        {
          claim_title: "Claim 3",
          claim_number: "4389",
          date_of_service: "March 3, 2025",
          status: "declined",
          in_network: false,
          provider: "AllergyRx Clinic",
          claim_description: "Allergy testing at an out-of-network provider."
        }
      ],
      paid_toward_personal_deductible: 800,
      paid_toward_family_deductible: 1600,
      member_plan: "2025 Gold PPO plan"
    };
  }

  return {
    member_id: memberId,
    first_name: "Jane",
    last_name: "Smith",
    phone_number: "+14215551234",
    email: "janesmith@gmail.com",
    address: {
      street: "123 Elm St",
      city: "Springfield",
      state: "IL",
      zip_code: "62701"
    },
    claims_list: [
      {
        claim_title: "Claim 1",
        claim_number: "2299",
        date_of_service: "July 28th, 2024",
        status: "approved",
        in_network: true,
        provider: "Central Baptist Pregnancy Center",
        claim_description: "Medical services for cesarean-section delivery."
      },
      {
        claim_title: "Claim 2",
        claim_number: "2746",
        date_of_service: "August 10, 2024",
        status: "pending, in process of adjudication",
        in_network: true,
        provider: "Central Baptist Pregnancy Center",
        claim_description: "Postpartum follow-up visit."
      }
    ],
    paid_toward_personal_deductible: 700,
    paid_toward_family_deductible: 1800,
    member_plan: "Gold PPO plan"
  };
}

function getPolicy(policyName) {
  return {
    policy_name: policyName || "2025 Gold PPO insurance policy",
    personal_deductible: 1500,
    family_deductible: 3000,
    covered_before_deductible_list: [
      "Preventive care",
      "Office visits",
      "Prescription drugs",
      "Urgent care",
      "Eye exams/glasses for children"
    ],
    out_of_pocket_limit_personal: 7800,
    out_of_pocket_limit_family: 15600,
    not_covered_in_out_of_pocket_list: [
      "Premiums",
      "Balance-billing charges",
      "Penalties for lack of preauthorization",
      "Non-covered services"
    ],
    in_network_coverage_list: [
      { service_name: "Primary Care Visits", copay_amount: 30, coinsurance_percentage: 0 },
      { service_name: "Specialist Visits", copay_amount: 60, coinsurance_percentage: 0 },
      { service_name: "Preventive Care", copay_amount: 0, coinsurance_percentage: 0 },
      { service_name: "Diagnostic Tests", copay_amount: 0, coinsurance_percentage: 25 },
      { service_name: "Imaging (CT/PET/MRI)", copay_amount: 0, coinsurance_percentage: 25 }
    ],
    out_of_network_coverage_list: [],
    in_network_drug_list: [
      { drug_type: "Generic Drugs", copay_amount: 15, home_delivery_cost: 25 },
      { drug_type: "Preferred Brand (non-generic) Drugs", copay_amount: 30, home_delivery_cost: 50 }
    ],
    out_of_network_drug_list: []
  };
}

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.post("/api/is_provider_authorized", (request, response) => {
  const { provider_id, npi_number } = request.body ?? {};

  if (typeof provider_id !== "string" || typeof npi_number !== "string") {
    return response.status(400).json({
      error: "provider_id and npi_number are required strings."
    });
  }

  // Demo behavior mirrors the original repository function.
  return response.status(200).json({ authorized: true });
});

app.post("/api/get_member_profile", (request, response) => {
  const { member_id, member_DOB } = request.body ?? {};
  const profile = getMemberProfile(member_id, member_DOB);

  if (profile.error) {
    return response.status(400).json(profile);
  }

  return response.status(200).json(profile);
});

app.post("/api/has_met_deductible", (request, response) => {
  const { paid_towards_deductible, member_personal_deductible } = request.body ?? {};
  const paid = Number(paid_towards_deductible);
  const deductible = Number(member_personal_deductible);

  if (!Number.isFinite(paid) || !Number.isFinite(deductible)) {
    return response.status(400).json({
      error: "paid_towards_deductible and member_personal_deductible must be numbers."
    });
  }

  return response.status(200).json({
    has_met_deductible: paid >= deductible
  });
});

app.post("/api/get_policy", (request, response) => {
  const { policy_name } = request.body ?? {};

  if (policy_name !== undefined && typeof policy_name !== "string") {
    return response.status(400).json({ error: "policy_name must be a string." });
  }

  return response.status(200).json(getPolicy(policy_name));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`Healthcare tools API listening on port ${port}`);
});
