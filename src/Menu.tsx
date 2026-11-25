
import { useEffect, useState } from "react";
import FoodCard from "./FoodCard";
import Checkout from "./Checkout";

type Meal = {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image_url: string | null;
  image_urls?: string[] | null;
  available: boolean;
};

type DiscountOffer = {
  id: number;
  meal_id: number;
  meal_name: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number | string;
  original_price: number | string;
  offer_price: number | string;
  start_date: string;
  end_date: string;
  active: boolean;
};


type OrderItem = {
  name: string;
  price: number;
  quantity: number;
};

type CustomerDetails = {
  name: string;
  phone: string;
  orderType: string;
  instructions: string;
};

function Menu() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [discountOffers, setDiscountOffers] = useState<DiscountOffer[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [order, setOrder] = useState<OrderItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [confirmation, setConfirmation] =
    useState<CustomerDetails | null>(null);

  // FETCH MEALS AND ACTIVE DISCOUNT OFFERS
  useEffect(() => {
    async function fetchMenuData() {
      try {
        setMenuLoading(true);
        setMenuError("");

        const [mealsResult, offersResult] = await Promise.all([
          fetch("/api/meals"),
          fetch("/api/discount-offers").catch((error) => {
            console.error("Fetching discount offers error:", error);
            return null;
          })
        ]);

        if (!mealsResult.ok) {
          const data = await mealsResult.json();
          throw new Error(data.message || "Unable to load menu.");
        }

        const mealsData = await mealsResult.json();
        setMeals(mealsData.meals || []);

        if (offersResult?.ok) {
          try {
            const offersData = await offersResult.json();
            setDiscountOffers(offersData.offers || []);
          } catch (error) {
            console.error("Reading discount offers error:", error);
            setDiscountOffers([]);
          }
        } else {
          setDiscountOffers([]);
        }

      } catch (error) {
        console.error("Fetching menu error:", error);

        setMenuError(
          error instanceof Error
            ? error.message
            : "Unable to load the restaurant menu."
        );

      } finally {
        setMenuLoading(false);
      }
    }

    fetchMenuData();
  }, []);

  // GET THE DISCOUNTED PRICE OF A MEAL
  function getMealPrice(meal: Meal): number {
    const offer = discountOffers.find(
      (item) => item.meal_id === meal.id && item.active
    );

    if (offer) {
      const offerPrice = Number(offer.offer_price);
      const originalPrice = Number(meal.price);

      if (
        Number.isFinite(offerPrice) &&
        offerPrice >= 0 &&
        offerPrice < originalPrice
      ) {
        return offerPrice;
      }
    }

    return Number(meal.price);
  }

  // ADD MEAL TO CART
  function addToOrder(foodName: string) {
    const selectedFood = meals.find(
      (food) => food.name === foodName && food.available
    );

    if (!selectedFood) return;

    const discountedPrice = getMealPrice(selectedFood);

    setOrder((currentOrder) => {
      const existingItem = currentOrder.find(
        (item) => item.name === foodName
      );

      if (existingItem) {
        return currentOrder.map((item) =>
          item.name === foodName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentOrder,
        {
          name: selectedFood.name,
          price: discountedPrice,
          quantity: 1
        }
      ];
    });

    setConfirmation(null);
  }

  // UPDATE CART QUANTITY
  function updateQuantity(foodName: string, change: number) {
    setOrder((currentOrder) =>
      currentOrder
        .map((item) =>
          item.name === foodName
            ? { ...item, quantity: item.quantity + change }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  // REMOVE ITEM FROM CART
  function removeFromOrder(foodName: string) {
    setOrder((currentOrder) =>
      currentOrder.filter((item) => item.name !== foodName)
    );
  }

  const totalItems = order.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = order.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // SUBMIT ORDER
  async function handleOrderSubmit(customer: CustomerDetails) {
    if (submitting) return;

    setSubmitting(true);
    setOrderError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...customer,
          items: order
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to place your order.");
      }

      setConfirmation(customer);
      setOrder([]);
      setShowCheckout(false);
      setShowCart(false);

    } catch (error) {
      console.error("Order submission error:", error);

      setOrderError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="menu-section" id="menu">

      <div className="menu-heading">
        <span>OUR SPECIALITIES</span>
        <h2>Explore Our Delicious Menu</h2>
        <p>
          Discover our carefully prepared meals,
          made with fresh ingredients and passion.
        </p>
      </div>

      {/* RESTAURANT MENU */}

      {menuLoading ? (
        <p className="menu-loading">
          Loading our delicious meals...
        </p>
      ) : menuError ? (
        <p className="menu-error">
          {menuError}
        </p>
      ) : meals.filter((meal) => meal.available).length === 0 ? (
        <p className="menu-loading">
          Our menu is being updated. Please check again soon.
        </p>
      ) : (
        <div className="menu-grid">
          {meals
            .filter((meal) => meal.available)
            .map((food) => {

              const mealImages =
                food.image_urls?.length
                  ? food.image_urls
                  : food.image_url
                    ? [food.image_url]
                    : [
                        "https://placehold.co/600x400?text=Meal+Image"
                      ];

              const offer = discountOffers.find(
                (item) =>
                  item.meal_id === food.id && item.active
              );

              const originalPrice = Number(
                offer?.original_price ?? food.price
              );

              const offerPrice = offer
                ? Number(offer.offer_price)
                : Number(food.price);

              const hasDiscount =
                !!offer &&
                Number.isFinite(offerPrice) &&
                offerPrice >= 0 &&
                offerPrice < originalPrice;

              const discountPercentage = hasDiscount
                ? Math.round(
                    ((originalPrice - offerPrice) / originalPrice) * 100
                  )
                : 0;

              const displayedPrice = hasDiscount
                ? offerPrice
                : Number(food.price);

              return (
                <FoodCard
                  key={food.id}
                  name={food.name}
                  price={`TSh ${displayedPrice.toLocaleString()}`}
                  originalPrice={
                    hasDiscount
                      ? `TSh ${originalPrice.toLocaleString()}`
                      : undefined
                  }
                  discountLabel={
                    hasDiscount
                      ? `${discountPercentage}% OFF`
                      : undefined
                  }
                  description={food.description}
                  image={mealImages[0]}
                  images={mealImages}
                  onAddToOrder={() => addToOrder(food.name)}
                />
              );
            })}
        </div>
      )}

      {/* FLOATING CART BUTTON */}

      <button
        className="floating-cart-btn"
        onClick={() => {
          setShowCart(true);
          setShowCheckout(false);
        }}
      >
        <span>🛒</span>
        <span>My Cart</span>
        <span className="cart-count">{totalItems}</span>
      </button>

      {/* CART OVERLAY */}

      {showCart && (
        <div
          className="cart-overlay"
          onClick={() => {
            if (!submitting) setShowCart(false);
          }}
        >
          <div
            className="cart-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cart-header">
              <h2>
                {showCheckout ? "Checkout" : "Your Shopping Cart"}
              </h2>

              <button
                className="cart-close-btn"
                disabled={submitting}
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(false);
                  setOrderError("");
                }}
              >
                ×
              </button>
            </div>

            {!showCheckout ? (
              <>
                {order.length === 0 ? (
                  <div className="empty-cart">
                    <span>🛒</span>
                    <h3>Your cart is empty</h3>
                    <p>Add some delicious meals to get started.</p>

                    <button onClick={() => setShowCart(false)}>
                      Explore Menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="cart-items">
                      {order.map((item) => (
                        <div className="cart-item" key={item.name}>
                          <div className="cart-item-info">
                            <strong>{item.name}</strong>
                            <p>
                              TSh {item.price.toLocaleString()}
                            </p>
                          </div>

                          <div className="quantity-controls">
                            <button
                              onClick={() =>
                                updateQuantity(item.name, -1)
                              }
                            >
                              −
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() =>
                                updateQuantity(item.name, 1)
                              }
                            >
                              +
                            </button>
                          </div>

                          <button
                            className="remove-item-btn"
                            onClick={() =>
                              removeFromOrder(item.name)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="cart-footer">
                      <div className="cart-total">
                        <span>Total</span>
                        <strong>
                          TSh {totalPrice.toLocaleString()}
                        </strong>
                      </div>

                      <button
                        className="checkout-btn"
                        onClick={() => {
                          setOrderError("");
                          setShowCheckout(true);
                        }}
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {orderError && (
                  <p style={{ color: "red", margin: "10px 0" }}>
                    {orderError}
                  </p>
                )}

                {submitting && (
                  <p style={{ margin: "10px 0" }}>
                    Submitting your order...
                  </p>
                )}

                <Checkout
                  total={totalPrice}
                  onClose={() => {
                    if (!submitting) setShowCheckout(false);
                  }}
                  onSubmit={handleOrderSubmit}
                />
              </>
            )}
          </div>
        </div>
      )}

      {/* ORDER CONFIRMATION */}

      {confirmation && (
        <div className="order-confirmation">
          <h2>Thank You, {confirmation.name}!</h2>
          <p>Your order has been received successfully.</p>
          <p>Order type: {confirmation.orderType}</p>
          <p>Phone: {confirmation.phone}</p>
          <p>
            Special instructions:{" "}
            {confirmation.instructions || "None"}
          </p>

          <button onClick={() => setConfirmation(null)}>
            Continue Browsing
          </button>
        </div>
      )}

    </section>
  );
}

export default Menu;
