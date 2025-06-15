
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BookOpen, Heart, List } from "lucide-react";

const featuredRecipes = [
  {
    title: "Rainbow Quinoa Salad",
    desc: "A colorful, protein-rich salad full of fiber.",
    img: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Grilled Herb Chicken",
    desc: "Lean chicken breast marinated in fresh herbs.",
    img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Berry Power Smoothie",
    desc: "A sweet, antioxidant-rich breakfast smoothie.",
    img: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=400&q=80",
  },
];

const steps = [
  {
    icon: <BookOpen className="text-primary mb-2" size={24} />,
    title: "Discover",
    text: "Explore healthy recipes for every goal."
  },
  {
    icon: <List className="text-primary mb-2" size={24} />,
    title: "Personalize",
    text: "Get personalized tips & create your healthy plan."
  },
  {
    icon: <Heart className="text-primary mb-2" size={24} />,
    title: "Enjoy",
    text: "Cook delicious meals and track your journey!"
  }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-b from-primary to-background pb-16 pt-8 md:pt-20 flex-grow">
        <div className="container mx-auto flex flex-col-reverse md:flex-row items-center gap-10 px-4">
          {/* Text Content */}
          <div className="flex-1 max-w-xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Healthy Recipes, <span className="text-primary">Made Easy</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Discover, personalize, and enjoy wholesome recipes tailored for your lifestyle. Eat better, feel better—starting now!
            </p>
            <Button size="lg" className="shadow font-semibold">Get Started</Button>
          </div>
          {/* Hero Image */}
          <div className="flex-1 flex justify-center md:justify-end">
            <img
              src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&q=80"
              alt="Healthy fruit bowl"
              className="rounded-lg shadow-lg w-80 h-80 object-cover border-4 border-primary/20"
              loading="lazy"
            />
          </div>
        </div>
      </header>

      {/* How it Works */}
      <section className="container mx-auto px-4 pt-10 pb-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">How it Works</h2>
        <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
          {steps.map((step, idx) => (
            <Card key={idx} className="flex-1 flex flex-col items-center p-6 text-center">
              <div className="mb-3">{step.icon}</div>
              <CardTitle className="mb-1">{step.title}</CardTitle>
              <CardDescription>{step.text}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Recipes */}
      <section className="container mx-auto px-4 pt-6 pb-14">
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Featured Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredRecipes.map((recipe, idx) => (
            <Card key={idx} className="p-0 hover:shadow-xl transition-shadow duration-200">
              <img
                src={recipe.img}
                alt={recipe.title}
                className="w-full h-48 object-cover rounded-t-lg"
                loading="lazy"
              />
              <CardContent className="pt-4">
                <CardTitle>{recipe.title}</CardTitle>
                <CardDescription>{recipe.desc}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;

