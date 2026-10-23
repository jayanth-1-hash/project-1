import { useState } from 'react';

const TESTIMONIALS = [
  { quote: "Excellent experience with Hyderabad Homes. Transparent process and great support throughout our home buying journey.", name: "Ramesh Kumar", role: "Resident, Skyline Heights", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "We found our dream home with their help. Highly professional and trustworthy team. The quality of construction is top-notch.", name: "Sneha Reddy", role: "Resident, Green Valley Villas", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "Quality construction and on-time delivery. Very happy with our new home and the community they've built here.", name: "Arjun Varma", role: "Resident, Urban One", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "The amenities at Lake View Greens are unmatched. The infinity pool and the organic parks make everyday living feel like a vacation. Highly recommended!", name: "Priya Sharma", role: "Resident, Lake View Greens", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "From site visit to possession, Hyderabad Homes made everything seamless. Their after-sales support is exceptional. Best real estate brand in the city.", name: "Vikram Reddy", role: "Investor, Skyline Heights", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "Beautiful architecture and incredible views! The layout of the apartments is so well thought out.", name: "Ananya Desai", role: "Resident, The Summit Commercial", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "A very smooth and transparent process. I never had to worry about hidden fees or delays.", name: "Kiran Rao", role: "Homeowner, Serenity Plots", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "The best decision I made was investing in a property here. Excellent returns and great community.", name: "Suresh Menon", role: "Investor, Crown Penthouses", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "Every small detail in the interior has been crafted with care. It's a joy to live here.", name: "Anita Kapoor", role: "Resident, Neo Studios", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "Perfect location, green surroundings, and safe environment for kids. We couldn't ask for more.", name: "Rajesh Singh", role: "Resident, Eco Gardens", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "Their team was extremely helpful in answering all my queries and guiding me through the paperwork.", name: "Meera Joshi", role: "Homeowner, Riverfront Elite", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "The property management is very proactive. Maintenance is done regularly and efficiently.", name: "Aditya Nair", role: "Resident, Industrial Lofts", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "I love the modern aesthetic of my new home. It completely matches my lifestyle.", name: "Divya Patel", role: "Resident, Oakwood Estates", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "Highly secure and safe society. The 24/7 security team is doing a phenomenal job.", name: "Kunal Gupta", role: "Resident, Skyline Heights", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "Moving here was the best choice for our family. The sense of community is amazing.", name: "Pooja Chawla", role: "Resident, Green Valley Villas", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "I recommend Hyderabad Homes to all my friends. Their dedication to quality is visible everywhere.", name: "Nitin Bose", role: "Resident, Urban One", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "The clubhouse and sports facilities are incredibly well-maintained. Always fun to spend weekends there.", name: "Swati Verma", role: "Resident, Lake View Greens", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "Beautiful landscapes and thoughtfully designed walking tracks. Feels very refreshing.", name: "Manoj Tiwari", role: "Resident, Eco Gardens", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "They delivered the project exactly when they promised. Such punctuality is rare in this industry.", name: "Rohit Das", role: "Resident, Neo Studios", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "The parking space is ample and very organized. Visitors never have an issue finding a spot.", name: "Shweta Iyer", role: "Resident, Crown Penthouses", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "Customer service is top-notch. Any issues are addressed immediately by the team.", name: "Karthik Raj", role: "Resident, Oakwood Estates", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "The overall vibe of the place is so peaceful. It’s the perfect retreat after a long day.", name: "Gaurav Singh", role: "Resident, Serenity Plots", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
  { quote: "A beautifully maintained society. The housekeeping staff does an incredible job daily.", name: "Neha Bhatia", role: "Resident, The Summit Commercial", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuASETJs4N_Wz9TIHzuLYKqVlnF2K7Da_I09T7qvx4EV1_4uY2ubqPKbHW_7YN4qGZWCrD-lXRL_MAsJulZkCY4wJ4WnoGFhiolQ8a0DAjsYWWV84pK5FrsfcnWWqXeb0WUes3F9ARDgtZX4TQLMC25yGnlBh7ZTATYZ6hzPl8WAOu1QmujPEMgGg6Fr4N7NITeib4RTzwmpGpLacG1yZg-UhtQDG0FVzXbvB_9k_01g7MY3gsjs5WJx0Tc80WgyzCTT33h2uABm8pPo" },
  { quote: "Great value for money. The location is prime and the property value has already appreciated.", name: "Rahul Deshmukh", role: "Investor, Riverfront Elite", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhUm8uJixHbSMxoCszFPRqTEooQCmFTwnBRt16rEW4dWWkxpnVSAp24eX39-ITaHJn-j56AeWUg9oF6lkiVQzdW4H_Afk9lcGv7xFknOF5yyk73ECo3CKs_ePSYfAoZllyaPF0wHpDCQbFAp8ZKsobjNTydVrfBS7VATVFu8qo0y2LxHfmtbSnDrOp3M1DhTFFVui8cgyA-ZEevAk5LORjPpAIsArSx9wnhpkg5Hg5KADdBV1yIKlDrFZML83RoVhIQK8f9DY4EiTh" },
  { quote: "So glad we chose this property. The build quality gives us peace of mind for decades to come.", name: "Simran Kaur", role: "Resident, Industrial Lofts", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC_lzW_8e1dPfe2KYpkifCD1c34ebX9grnVTMXiwXfT9KzYkA7Yl0zZPrHnz0j8Yu1Wei1qfHwv0Y1VkSPtqP3ny6d5RNjYwdAKU-PtSvGa0VBRf66KQLyzhA4XJc3DU8ygEua_34EFXi5ubFhWMqAwGdKAXvOGhq8A49zxmT-JTqlWblFgIAIx7TY3nM0iwnxk9bN0q9LsQGvKxKeGX_xsMG7JiybGyFCM8TiD0icoAmih7Wi3hCn8NWsar3uZuwD7F9fAAXhVcYe4" },
]; export function TestimonialsSection() {
  const avatars = ["/avatar_1.png", "/avatar_2.png", "/avatar_3.png"];
  const [showAll, setShowAll] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);

  const handleCardTap = (index: number) => {
    // Toggle active state and pause/play
    if (activeCardIndex === index) {
      setActiveCardIndex(null); // resume
    } else {
      setActiveCardIndex(index); // pause and highlight
    }
  };

  return (
    <section className="py-8 md:py-12 bg-primary text-on-primary overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-grid-margin">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 gap-4 md:gap-8">
          <div className="max-w-xl text-center md:text-left">
            <span className="font-label-sm text-[10px] md:text-xs text-primary-fixed uppercase tracking-widest mb-2 md:mb-4 block">Testimonials</span>
            <h2 className="font-headline-lg text-2xl md:text-4xl">What Our Customers Say</h2>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="px-4 py-2 md:px-6 md:py-3 rounded-full border border-white text-white hover:bg-white hover:text-primary active:bg-white active:text-primary transition-colors font-label-sm md:font-label-lg font-bold"
          >
            {showAll ? 'View Less' : 'View All'}
          </button>
        </div>

        {showAll ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-primary/20 p-5 md:p-8 rounded-[20px] md:rounded-[30px] border border-primary-fixed/20 space-y-4 md:space-y-6 hover:bg-white hover:text-primary active:bg-white active:text-primary transition-colors duration-300 group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <span className="material-symbols-outlined text-tertiary-fixed text-2xl md:text-4xl group-hover:text-primary group-active:text-primary transition-colors" style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
                  <p className="font-body-md md:font-body-lg italic opacity-95 text-white group-hover:text-primary group-active:text-primary transition-colors mt-2 md:mt-4">"{t.quote}"</p>
                </div>
                <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4 mt-4 md:mt-6">
                  <img src={avatars[i % avatars.length]} alt={t.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed" />
                  <div>
                    <div className="font-bold text-sm md:text-base text-white group-hover:text-primary group-active:text-primary transition-colors">{t.name}</div>
                    <div className="text-[10px] md:text-xs opacity-80 text-white group-hover:text-primary/70 group-active:text-primary/70 transition-colors">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full -mx-6 px-6 md:-mx-4 md:px-4 sm:mx-0 sm:px-0 marquee-wrapper">
            <style>{`
              @keyframes marqueeScrollTestimonials {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .marquee-wrapper:hover .marquee-track {
                animation-play-state: paused !important;
              }
            `}</style>
            <div
              className="flex gap-4 md:gap-6 w-max marquee-track"
              style={{
                animation: 'marqueeScrollTestimonials 150s linear infinite',
                animationPlayState: activeCardIndex !== null ? 'paused' : 'running'
              }}
            >
              {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => {
                const isActive = activeCardIndex === i;
                return (
                  <div
                    key={i}
                    onClick={() => handleCardTap(i)}
                    className={`w-[260px] md:w-[400px] shrink-0 p-5 md:p-8 rounded-[20px] md:rounded-[30px] border space-y-4 md:space-y-6 transition-colors duration-300 group cursor-pointer flex flex-col justify-between touch-manipulation select-none ${isActive ? 'bg-white text-primary border-white' : 'bg-primary/20 border-primary-fixed/20 hover:bg-white hover:text-primary hover:border-white'}`}
                  >
                    <div>
                      <span className={`material-symbols-outlined text-2xl md:text-4xl transition-colors ${isActive ? 'text-primary' : 'text-tertiary-fixed group-hover:text-primary'}`} style={{ fontVariationSettings: '"FILL" 1' }}>format_quote</span>
                      <p className={`font-body-md md:font-body-lg italic opacity-95 transition-colors mt-2 md:mt-4 ${isActive ? 'text-primary' : 'text-white group-hover:text-primary'}`}>"{t.quote}"</p>
                    </div>
                    <div className="flex items-center gap-3 md:gap-4 pt-2 md:pt-4 mt-4 md:mt-6">
                      <img src={avatars[i % avatars.length]} alt={t.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover shadow-sm ring-2 ring-primary-fixed" />
                      <div>
                        <div className={`font-bold text-sm md:text-base transition-colors ${isActive ? 'text-primary' : 'text-white group-hover:text-primary'}`}>{t.name}</div>
                        <div className={`text-[10px] md:text-xs opacity-80 transition-colors ${isActive ? 'text-primary/70' : 'text-white group-hover:text-primary/70'}`}>{t.role}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
