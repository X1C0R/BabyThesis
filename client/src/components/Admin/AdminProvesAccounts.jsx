import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminProvesAccounts = () => {
  const [pendingLandlords, setPendingLandlords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // for image modal

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:4000/pending-landlords");
      setPendingLandlords(res.data.landlords);
    } catch (err) {
      console.error("Error fetching landlords:", err);
      alert("Failed to load pending landlords");
    } finally {
      setLoading(false);
    }
  };

  const approveLandlord = async (id) => {
    if (!window.confirm("Approve this landlord?")) return;
    try {
      await axios.put(`http://localhost:4000/approve/${id}`);
      alert("Landlord approved successfully!");
      setPendingLandlords((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Error approving landlord:", err);
      alert("Failed to approve landlord");
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🏠 Admin Dashboard
      </h1>

      {loading ? (
        <p className="text-center">Loading pending landlords...</p>
      ) : pendingLandlords.length === 0 ? (
        <p className="text-center text-gray-600">No pending landlords.</p>
      ) : (
        <div className="overflow-x-auto shadow rounded-lg bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">ID Image</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingLandlords.map((landlord) => (
                <tr
                  key={landlord.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{landlord.full_name}</td>
                  <td className="px-4 py-3">{landlord.email}</td>
                  <td className="px-4 py-3">{landlord.contact_number}</td>
                  <td className="px-4 py-3">
                    {landlord.id_image_url && landlord.id_image ? (
                      <button
                        onClick={() =>
                          setSelectedImage({
                            idImage1: landlord.id_image_url,
                            id2: landlord.id_image,
                          })
                        }
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        View ID
                      </button>
                    ) : (
                      "No ID Uploaded"
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => approveLandlord(landlord.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Approve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🖼️ Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 flex justify-center items-center z-50 cursor-pointer mt-10"
        >
            <div className="flex flex-row gap-10">
            <div className="">
              <p className="">Image 1</p>
              <img
                src={selectedImage.idImage1}
                alt="ID Preview"
                className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
              />
            </div>
              <div>
                <p>Image 2</p>
                <img src={selectedImage.id2} alt="ID Preview"
                className="max-h-[90dvh]  max-w-[90vw] rounded-lg shadow-lg"  />
              </div>
              <button
              onClick={() => setSelectedImage(null)}
              className="w-fit h-fit bg-red-600 text-white rounded-full px-3 py-1 hover:bg-red-700"
            >
              ✕
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProvesAccounts;
