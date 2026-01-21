import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_COMPLETED_ONBOARDING_LEADS,
  GET_NEW_ONBOARDING_LEADS,
} from "@/graphql/onboardingList.gql";

/* ================= TYPES ================= */

type LeadStatus = "NEW" | "COMPLETED";

type Lead = {
  id: string;
  name: string;
  source: string;
  mobile: string;
  status: LeadStatus;
};

/* ================= PREVIEW MODAL ================= */

function PreviewModal({
  lead,
  onClose,
}: {
  lead: Lead | null;
  onClose: () => void;
}) {
  if (!lead) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">
          Client Profile Preview
        </h3>

        <div className="space-y-3 text-sm">
          <div><span className="text-gray-500">Lead ID:</span> <span className="font-medium">{lead.id}</span></div>
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{lead.name}</span></div>
          <div><span className="text-gray-500">Mobile:</span> <span className="font-medium">{lead.mobile}</span></div>
          <div><span className="text-gray-500">Source:</span> <span className="font-medium">{lead.source}</span></div>
          <div><span className="text-gray-500">Status:</span> <span className="font-medium">Completed</span></div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-600 text-white text-sm hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= TABLE HEADER ================= */

function TableHeader() {
  return (
    <thead className="bg-gray-900 border-b hidden sm:table-header-group">
      <tr className="text-xs font-semibold text-gray-400 uppercase">
        <th className="px-4 py-3 w-1/6 text-left">Lead ID</th>
        <th className="px-4 py-3 w-1/6 text-left">Name</th>
        <th className="px-4 py-3 w-1/6 text-center">Mobile</th>
        <th className="px-4 py-3 w-1/6 text-center">Status</th>
        <th className="px-4 py-3 w-1/6 text-center">Client ID</th>
        <th className="px-4 py-3 w-1/6 text-center">Action</th>
      </tr>
    </thead>
  );
}

/* ================= LEAD ROW ================= */

function LeadRow({
  lead,
  onOnboard,
  onView,
}: {
  lead: Lead;
  onOnboard: () => void;
  onView: () => void;
}) {
  return (
    <tr className="border-b border-gray-700 last:border-0 hover:bg-gray-800">
      <td className="px-4 py-3 font-medium text-left whitespace-nowrap text-gray-100">{lead.id}</td>

      <td className="px-4 py-3 text-left">
        <div className="font-medium text-gray-100">{lead.name}</div>
        <div className="text-xs text-gray-500">{lead.source}</div>
      </td>

      <td className="px-4 py-3 text-center whitespace-nowrap text-gray-100">{lead.mobile}</td>

      <td className="px-4 py-3 text-center">
        {lead.status === "COMPLETED" ? (
          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
            Completed
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        )}
      </td>

      <td className="px-4 py-3 text-center text-gray-500">-</td>

      <td className="px-4 py-3 text-center whitespace-nowrap">
        {lead.status === "COMPLETED" ? (
          <button
            onClick={onView}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-gray-600 text-white hover:bg-gray-700"
          >
            View
          </button>
        ) : (
          <button
            onClick={onOnboard}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-brand-500 text-white hover:bg-brand-600"
          >
            Onboard
          </button>
        )}
      </td>
    </tr>
  );
}

/* ================= TABLE CARD ================= */

function TableCard({
  title,
  leads,
  onOnboard,
  onView,
  loading,
}: {
  title: string;
  leads: Lead[];
  onOnboard: (lead: Lead) => void;
  onView: (lead: Lead) => void;
  loading?: boolean;
}) {
  return (
    <div className="mb-10">
      <h3 className="text-sm font-semibold text-gray-200 mb-3">
        {title}
      </h3>

      {/* ✅ RESPONSIVE WRAPPER */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 shadow-lg overflow-x-auto">
        <table className="w-full min-w-[720px] table-fixed text-sm">
          <TableHeader />
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onOnboard={() => onOnboard(lead)}
                  onView={() => onView(lead)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================= PAGE ================= */

export default function OnboardingListPage() {
  const navigate = useNavigate();
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);

  const {
    data: newData,
    loading: loadingNew,
    error: errorNew,
    refetch: refetchNew,
  } = useQuery(GET_NEW_ONBOARDING_LEADS, { fetchPolicy: "network-only" });

  const {
    data: completedData,
    loading: loadingCompleted,
    error: errorCompleted,
    refetch: refetchCompleted,
  } = useQuery(GET_COMPLETED_ONBOARDING_LEADS, { fetchPolicy: "network-only" });

  const newLeads = useMemo<Lead[]>(
    () =>
      (newData?.onboardingNewLeads ?? []).map((lead: any) => ({
        id: lead?.id ?? "-",
        name: lead?.name ?? "-",
        source: lead?.source ?? "-",
        mobile: lead?.mobile ?? "-",
        status: "NEW",
      })),
    [newData],
  );

  const completedLeads = useMemo<Lead[]>(
    () =>
      (completedData?.onboardingCompletedLeads ?? []).map((lead: any) => ({
        id: lead?.id ?? "-",
        name: lead?.name ?? "-",
        source: lead?.source ?? "-",
        mobile: lead?.mobile ?? "-",
        status: "COMPLETED",
      })),
    [completedData],
  );

  const handleRefetch = () => {
    void refetchNew();
    void refetchCompleted();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-lg font-semibold mb-6 text-gray-100">
        Onboarding List
      </h2>

      {(errorNew || errorCompleted) && (
        <div className="mb-4 rounded-lg border border-amber-700 bg-amber-900/20 px-4 py-3 text-sm text-amber-400">
          Unable to load onboarding data. Please try again.
          <button
            type="button"
            onClick={handleRefetch}
            className="ml-3 inline-flex items-center rounded border border-amber-300 px-3 py-1 text-xs font-semibold hover:bg-amber-100"
          >
            Retry
          </button>
        </div>
      )}

      <TableCard
        title="New Onboard List"
        leads={newLeads}
        loading={loadingNew}
        onOnboard={() =>
          navigate("/sales/onboarding/process/client-profile")
        }
        onView={() => {}}
      />

      <TableCard
        title="Onboarding Completed"
        leads={completedLeads}
        loading={loadingCompleted}
        onOnboard={() => {}}
        onView={(lead) => setPreviewLead(lead)}
      />

      <PreviewModal
        lead={previewLead}
        onClose={() => setPreviewLead(null)}
      />
    </div>
  );
}
