import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Star, Send, CheckCircle } from 'lucide-react';

export default function CustomerFeedbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [rating, setRating] = useState<number>(0);
    const [hoveredRating, setHoveredRating] = useState<number>(0);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Mock data - In production, fetch based on token
    const workflowData = {
        workflowCode: 'WF-2024-0001',
        customerName: 'John Doe',
        vehicleInfo: 'Honda Civic 2020 (WXY 1234)',
        serviceAdvisor: {
            name: 'Ahmad bin Rahman',
            phone: '+60 12-345 6789',
            email: 'ahmad@autoworkshop.com'
        },
        completionDate: '15/02/2026'
    };

    const handleSubmit = () => {
        // In production, send feedback to backend
        console.log('Feedback submitted:', { rating, feedback, token });
        setSubmitted(true);
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
                    <p className="text-gray-600">This feedback link is invalid or has expired.</p>
                </div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-900 mb-2">Thank You!</h1>
                    <p className="text-gray-700 mb-4">
                        Your feedback has been submitted successfully. We appreciate your time and input!
                    </p>
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-green-800">
                            Your {rating}-star rating and comments will help us serve you better.
                        </p>
                    </div>
                    <p className="text-sm text-gray-600">
                        You can now close this window.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-2xl shadow-lg p-6 border-b-4 border-indigo-500">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">We Value Your Feedback! 💬</h1>
                        <p className="text-gray-600">Help us improve our service by sharing your experience</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white shadow-lg p-8 space-y-6">
                    {/* Workflow Info */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h3 className="font-semibold text-indigo-900 mb-2">Service Details</h3>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p><strong>Workflow:</strong> {workflowData.workflowCode}</p>
                            <p><strong>Customer:</strong> {workflowData.customerName}</p>
                            <p><strong>Vehicle:</strong> {workflowData.vehicleInfo}</p>
                            <p><strong>Completed:</strong> {workflowData.completionDate}</p>
                        </div>
                    </div>

                    {/* Service Advisor Info */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Your Service Advisor</h3>
                        <div className="space-y-1 text-sm text-gray-700">
                            <p><strong>Name:</strong> {workflowData.serviceAdvisor.name}</p>
                            <p><strong>Phone:</strong> {workflowData.serviceAdvisor.phone}</p>
                            <p><strong>Email:</strong> {workflowData.serviceAdvisor.email}</p>
                        </div>
                    </div>

                    {/* Rating Section */}
                    <div className="space-y-3">
                        <label className="block text-lg font-semibold text-gray-900">
                            How satisfied are you with our service? ⭐
                        </label>
                        <div className="flex gap-3 justify-center py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-125"
                                >
                                    <Star
                                        className={`w-12 h-12 ${
                                            star <= (hoveredRating || rating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-lg font-semibold text-indigo-600">
                                {rating === 5 && '🌟 Excellent!'}
                                {rating === 4 && '😊 Very Good!'}
                                {rating === 3 && '👍 Good'}
                                {rating === 2 && '😐 Fair'}
                                {rating === 1 && '😞 Needs Improvement'}
                            </p>
                        )}
                    </div>

                    {/* Feedback Text */}
                    <div className="space-y-3">
                        <label className="block text-lg font-semibold text-gray-900">
                            Share your experience with us 📝
                        </label>
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            rows={6}
                            placeholder="Tell us about your experience... What did we do well? How can we improve?"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                        />
                        <p className="text-sm text-gray-500">
                            Your feedback helps us provide better service to all our customers.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={rating === 0}
                        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                            rating === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                        }`}
                    >
                        <Send className="w-6 h-6" />
                        Submit Feedback
                    </button>

                    {rating === 0 && (
                        <p className="text-center text-sm text-red-600 font-medium">
                            Please select a star rating before submitting
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-white rounded-b-2xl shadow-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                        Thank you for choosing AutoWorkshop! 🚗
                    </p>
                </div>
            </div>
        </div>
    );
}
