import React from 'react';
import { ElectronicsIcon } from '../components/icons/ElectronicsIcon';
import { CarIcon } from '../components/icons/CarIcon';
import { HouseIcon } from '../components/icons/HouseIcon';
import { FashionIcon } from '../components/icons/FashionIcon';
import { PlantIcon } from '../components/icons/PlantIcon';
import { HobbiesIcon } from '../components/icons/HobbiesIcon';
import { MarketplaceIcon } from '../components/icons/MarketplaceIcon';
import { TourismIcon } from '../components/icons/TourismIcon';
import { HealthcareIcon } from '../components/icons/HealthcareIcon';
import { EducationIcon } from '../components/icons/EducationIcon';
import { ServicesIcon } from '../components/icons/ServicesIcon';
import { RetailIcon } from '../components/icons/RetailIcon';
import { DefaultCategoryIcon } from '../components/icons/DefaultCategoryIcon';

export const CATEGORIES_STORAGE_KEY = 'mazdady_dynamic_categories';

export const DEFAULT_CATEGORIES = {
    "E-Commerce": {
        "B2B (Business-to-Business)": {},
        "B2C (Business-to-Consumer)": {},
        "C2C (Consumer-to-Consumer)": {},
        "Retail Stores": {},
        "Wholesale": {},
        "Digital Products": {},
        "Physical Goods": {},
        "Dropshipping": {},
        "Specialty Stores": {},
        "Online Marketplaces": {},
    },
    "Real Estate": {
        "Property for Sale": {},
        "Residential Rentals": {},
        "Commercial Properties": {},
        "Offices": {},
        "Land": {},
        "Furnished Apartments": {},
        "Luxury Real Estate": {},
        "Real Estate Investment": {},
        "Property Management": {},
        "Real Estate Valuation": {},
    },
    "Automotive & Transportation": {
        "New Cars": {},
        "Used Cars": {},
        "Auto Parts & Accessories": {},
        "Car Rental": {},
        "Transportation Services": {},
        "Taxi Services": {},
        "Public Transport": {},
        "Trucks & Commercial Vehicles": {},
        "Motorcycles": {},
        "Bicycles": {},
    },
    "Electronics & Technology": {
        "Smartphones": {},
        "Computers & Laptops": {},
        "Tablets": {},
        "Home Appliances": {},
        "Cameras & Photography": {},
        "Gaming Consoles & Video Games": {},
        "Software": {},
        "Tech Accessories": {},
        "Wearable Technology": {},
        "Smart Home Devices": {},
    },
    "Fashion & Apparel": {
        "Men's Clothing": {},
        "Women's Clothing": {},
        "Kids' Clothing": {},
        "Footwear": {},
        "Fashion Accessories": {},
        "Jewelry": {},
        "Watches": {},
        "Bags & Luggage": {},
        "Eyewear": {},
        "Underwear & Lingerie": {},
    },
    "Beauty & Personal Care": {
        "Cosmetics & Makeup": {},
        "Skincare": {},
        "Hair Care": {},
        "Fragrances & Perfumes": {},
        "Nail Care": {},
        "Bath & Body Products": {},
        "Beauty Tools": {},
        "Men's Grooming": {},
        "Baby Care": {},
        "Organic & Natural Products": {},
    },
    "Home, Garden & DIY": {
        "Furniture": {},
        "Home Decor": {},
        "Kitchen & Dining Supplies": {},
        "Bathroom Supplies": {},
        "Cleaning Supplies": {},
        "Garden & Outdoor": {},
        "Lighting": {},
        "Rugs & Carpets": {},
        "Bedding": {},
        "Storage & Organization": {},
    },
    "Mother & Baby": {
        "Kids' Fashion": {},
        "Toys & Games": {},
        "Feeding & Nursing": {},
        "Baby Care Essentials": {},
        "Nursery Furniture": {},
        "Safety Equipment": {},
        "Strollers & Prams": {},
        "Car Seats": {},
        "Baby Food": {},
        "Early Learning": {},
    },
    "Hobbies, Sports & Leisure": {
        "Sporting Goods": {},
        "Fitness & Bodybuilding": {},
        "Team Sports": {},
        "Hunting & Camping": {},
        "Musical Instruments": {},
        "Books & Magazines": {},
        "Arts & Crafts": {},
        "Collectibles": {},
        "Games & Puzzles": {},
        "Gardening": {},
    },
    "Education": {
        "Textbooks": {},
        "General Books": {},
        "Online Courses": {},
        "Office Supplies": {},
        "School Supplies": {},
        "E-Learning Platforms": {},
        "Libraries": {},
        "Training Programs": {},
        "Educational Materials": {},
        "Certifications": {},
    },
    "Jobs & Career": {
        "Full-Time Jobs": {},
        "Part-Time Jobs": {},
        "Freelancing": {},
        "Internships": {},
        "Remote Work": {},
        "Government Jobs": {},
        "Private Sector Jobs": {},
        "Healthcare Jobs": {},
        "Education Jobs": {},
        "Tech Jobs": {},
    },
    "Health & Medical": {
        "Hospitals": {},
        "Clinics": {},
        "Pharmacies": {},
        "Doctors": {},
        "Nursing": {},
        "Physical Therapy": {},
        "Mental Health": {},
        "Nutrition & Dietetics": {},
        "Fitness & Gym": {},
        "Medical Equipment": {},
    },
    "Food & Beverage": {
        "Restaurants": {},
        "Cafes & Coffee Shops": {},
        "Food Delivery": {},
        "Groceries": {},
        "Meat & Poultry": {},
        "Vegetables": {},
        "Fruits": {},
        "Bakery": {},
        "Beverages": {},
        "Sweets & Desserts": {},
    },
    "Pets & Animals": {
        "Pet Food": {},
        "Pet Toys": {},
        "Pet Apparel": {},
        "Pet Healthcare": {},
        "Training Equipment": {},
        "Grooming Services": {},
        "Pet Hotels & Boarding": {},
        "Pet Adoption": {},
        "Pet Breeding": {},
        "Pet Accessories": {},
    },
    "Events & Occasions": {
        "Weddings": {},
        "Conferences": {},
        "Parties": {},
        "Exhibitions & Trade Shows": {},
        "Seminars & Workshops": {},
        "Holidays": {},
        "Religious Events": {},
        "Sports Events": {},
        "Festivals": {},
        "Concerts": {},
    },
    "Professional & Local Services": {
        "Plumbing": {},
        "Carpentry": {},
        "Electrical Services": {},
        "Painting": {},
        "HVAC (Heating, Ventilation, Air Conditioning)": {},
        "Cleaning Services": {},
        "Design Services": {},
        "Programming & Tech Support": {},
        "Translation Services": {},
        "Business Consulting": {},
    },
    "Travel & Tourism": {
        "Hotels": {},
        "Apartments & Villas": {},
        "Flight Tickets": {},
        "Tour Packages": {},
        "Guided Tours": {},
        "Visas & Immigration": {},
        "Travel Insurance": {},
        "Luggage": {},
        "Tour Guides": {},
        "Car Rentals": {},
    },
    "Creative Services": {
        "Graphic Design": {},
        "Photography": {},
        "Writing & Copywriting": {},
        "Marketing": {},
        "Programming & Development": {},
        "Video & Audio Editing": {},
        "Advertising": {},
        "Production": {},
        "Distribution": {},
        "Publishing": {},
    },
    "Financial Services": {
        "Banking": {},
        "Insurance": {},
        "Investment": {},
        "Loans": {},
        "Money Transfer": {},
        "Digital Payments": {},
        "Accounting": {},
        "Auditing": {},
        "Financial Planning": {},
        "Cryptocurrencies & Forex": {},
    },
    "Legal Services": {
        "Law Firms & Lawyers": {},
        "Notarization": {},
        "Legal Consultations": {},
        "Legal Drafting": {},
        "Arbitration": {},
        "Registration Services": {},
        "Intellectual Property": {},
        "Contracts": {},
        "Litigation": {},
        "Legal Advice": {},
    },
    "Industrial & Manufacturing": {
        "Factories": {},
        "Workshops": {},
        "Manufacturing": {},
        "Assembly": {},
        "Packaging": {},
        "Industrial Transport": {},
        "Warehousing & Storage": {},
        "Quality Control": {},
        "Maintenance": {},
        "Research & Development": {},
    },
    "Agricultural Sector": {
        "Farms": {},
        "Greenhouses": {},
        "Agricultural Equipment": {},
        "Pesticides": {},
        "Fertilizers": {},
        "Seeds": {},
        "Livestock": {},
        "Poultry": {},
        "Aquaculture (Fish Farming)": {},
        "Organic Products": {},
    },
    "Logistics & Supply Chain": {
        "Shipping & Freight": {},
        "Transportation": {},
        "Storage": {},
        "Distribution": {},
        "Packaging": {},
        "Customs Clearance": {},
        "Warehouses": {},
        "Delivery Services": {},
        "Tracking": {},
        "Logistics Management": {},
    },
    "Gifts & Flowers": {
        "Flower Bouquets": {},
        "Plants": {},
        "Gifts for Men": {},
        "Gifts for Women": {},
        "Gifts for Kids": {},
        "Occasion-Specific Gifts": {},
        "Chocolates": {},
        "Perfumes": {},
        "Accessories as Gifts": {},
        "Personalized Gifts": {},
    },
    "Media & Entertainment": {
        "Movies": {},
        "TV Series": {},
        "Music": {},
        "Gaming": {},
        "Books": {},
        "Magazines": {},
        "Newspapers": {},
        "Radio": {},
        "Television": {},
        "Live Streaming": {},
    },
    "Government Services": {
        "IDs & Cards": {},
        "Licenses & Permits": {},
        "Document Attestation": {},
        "Certificates": {},
        "Document Services": {},
        "Municipal Services": {},
        "Passports & Immigration": {},
        "Civil Affairs": {},
        "Traffic & Vehicle Services": {},
        "Tax Services": {},
    },
    "Security & Safety": {
        "Surveillance Systems": {},
        "Alarm Systems": {},
        "Detection Devices": {},
        "Firefighting Equipment": {},
        "Security Equipment": {},
        "Security Training": {},
        "Security Consultancy": {},
        "Inspection Services": {},
        "Maintenance": {},
        "Development": {},
    },
    "Environment & Energy": {
        "Solar Energy": {},
        "Wind Energy": {},
        "Recycling": {},
        "Water Treatment": {},
        "Waste Management": {},
        "Afforestation": {},
        "Purification": {},
        "Sustainability": {},
        "Awareness": {},
        "Equipment": {},
    },
    "Innovation & Tech": {
        "Artificial Intelligence (AI)": {},
        "Blockchain": {},
        "Internet of Things (IoT)": {},
        "Robotics": {},
        "Mobile Apps": {},
        "Platforms": {},
        "Tech Solutions": {},
        "IT Consultancy": {},
        "Development": {},
        "Training": {},
    }
};


export const getCategoryIcon = (categoryName: string): React.ReactElement => {
    // Normalize name: "E-Commerce" -> "ecommerce", "Automotive & Transportation" -> "automotivetransportation"
    const normalizedName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '');
    switch (normalizedName) {
        case 'ecommerce': return React.createElement(RetailIcon);
        case 'realestate': return React.createElement(HouseIcon);
        case 'automotivetransportation': return React.createElement(CarIcon);
        case 'electronicstechnology': return React.createElement(ElectronicsIcon);
        case 'fashionapparel': return React.createElement(FashionIcon);
        case 'beautyandpersonalcare': return React.createElement(DefaultCategoryIcon);
        case 'homegardendiy': return React.createElement(PlantIcon);
        case 'motherbaby': return React.createElement(DefaultCategoryIcon);
        case 'hobbiessportsleisure': return React.createElement(HobbiesIcon);
        case 'education': return React.createElement(EducationIcon);
        case 'jobscareer': return React.createElement(ServicesIcon);
        case 'healthmedical': return React.createElement(HealthcareIcon);
        case 'foodbeverage': return React.createElement(MarketplaceIcon);
        case 'petsanimals': return React.createElement(DefaultCategoryIcon);
        case 'eventsoccasions': return React.createElement(DefaultCategoryIcon);
        case 'professionallocalservices': return React.createElement(ServicesIcon);
        case 'traveltourism': return React.createElement(TourismIcon);
        case 'creativeservices': return React.createElement(ServicesIcon);
        case 'financialservices': return React.createElement(DefaultCategoryIcon);
        case 'legalservices': return React.createElement(ServicesIcon);
        case 'industrialmanufacturing': return React.createElement(DefaultCategoryIcon);
        case 'agriculturalsector': return React.createElement(PlantIcon);
        case 'logisticssupplychain': return React.createElement(CarIcon);
        case 'giftsflowers': return React.createElement(DefaultCategoryIcon);
        case 'mediaentertainment': return React.createElement(DefaultCategoryIcon);
        case 'governmentservices': return React.createElement(ServicesIcon);
        case 'securitysafety': return React.createElement(DefaultCategoryIcon);
        case 'environmentenergy': return React.createElement(PlantIcon);
        case 'innovationtech': return React.createElement(ElectronicsIcon);
        default: return React.createElement(DefaultCategoryIcon);
    }
};