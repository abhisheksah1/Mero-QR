import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  getMenu,
  createCategory,
  updateCategory,
  deleteCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/api";
import {
  Card,
  Btn,
  Field,
  Select,
  Badge,
  PageHeader,
  FormGrid,
  FormActions,
  Empty,
  Spinner,
} from "../../components/common/UI";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// Custom Modal Component with Portal
const CustomModal = ({ open, onClose, title, children, size = "md" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  const sizes = {
    sm: { minWidth: "300px", maxWidth: "400px" },
    md: { minWidth: "400px", maxWidth: "500px" },
    lg: { minWidth: "500px", maxWidth: "600px" },
  };

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          animation: "fadeIn 0.2s ease-out",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--bg1)",
          borderRadius: "16px",
          padding: "28px",
          ...sizes[size],
          width: "90%",
          zIndex: 10000,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid var(--border)",
          animation: "slideUp 0.3s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            paddingBottom: "16px",
            borderBottom: "2px solid var(--border)",
          }}
        >
          <h3
            style={{
              fontSize: "20px",
              fontFamily: "var(--font-display)",
              margin: 0,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, var(--accent), var(--accent2))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "var(--bg3)",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--text3)",
              padding: "0",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--danger)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg3)";
              e.currentTarget.style.color = "var(--text3)";
            }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -40%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>,
    document.body,
  );
};

// Confirmation Dialog Component
const ConfirmDialog = ({ open, onClose, onConfirm, title, message }) => {
  if (!open) return null;

  return createPortal(
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          zIndex: 9998,
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "var(--bg1)",
          borderRadius: "12px",
          padding: "24px",
          minWidth: "300px",
          maxWidth: "400px",
          width: "90%",
          zIndex: 9999,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <AlertCircle size={48} color="var(--danger)" />
        </div>
        <h3 style={{ margin: "0 0 8px 0", textAlign: "center" }}>{title}</h3>
        <p
          style={{
            color: "var(--text3)",
            textAlign: "center",
            marginBottom: "24px",
          }}
        >
          {message}
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Btn variant="ghost" onClick={onClose}>
            Cancel
          </Btn>
          <Btn variant="danger" onClick={onConfirm}>
            Delete
          </Btn>
        </div>
      </div>
    </>,
    document.body,
  );
};

// Category Card Component
const CategoryCard = ({
  category,
  onToggleExpand,
  isExpanded,
  onAddItem,
  onEditCategory,
  onDeleteCategory,
  onEditItem,
  onDeleteItem,
  onToggleItemAvailability,
}) => {
  return (
    <Card
      style={{
        marginBottom: "20px",
        padding: 0,
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: "1px solid var(--border)",
      }}
    >
      {/* Category Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          cursor: "pointer",
          background: "linear-gradient(135deg, var(--bg3), var(--bg2))",
          transition: "all 0.2s",
        }}
        onClick={onToggleExpand}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flex: 1,
          }}
        >
          {isExpanded ? (
            <ChevronDown size={18} color="var(--accent)" />
          ) : (
            <ChevronRight size={18} color="var(--accent)" />
          )}
          <div>
            <h3
              style={{
                fontSize: "16px",
                fontFamily: "var(--font-display)",
                margin: 0,
                fontWeight: 600,
              }}
            >
              {category.name}
            </h3>
            {category.description && (
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text3)",
                  margin: "4px 0 0 0",
                }}
              >
                {category.description}
              </p>
            )}
          </div>
          <Badge color="primary" style={{ marginLeft: "8px" }}>
            {category.items?.length || 0} items
          </Badge>
        </div>
        <div
          style={{ display: "flex", gap: "8px" }}
          onClick={(e) => e.stopPropagation()}
        >
          <Btn
            size="sm"
            variant="ghost"
            icon={<Edit2 size={14} />}
            onClick={onEditCategory}
            title="Edit Category"
          />
          <Btn
            size="sm"
            variant="danger"
            icon={<Trash2 size={14} />}
            onClick={onDeleteCategory}
            title="Delete Category"
          />
          <Btn
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={onAddItem}
            title="Add Item"
          >
            Add Item
          </Btn>
        </div>
      </div>

      {/* Items List */}
      {isExpanded && (
        <div style={{ padding: "8px 0" }}>
          {category.items?.length === 0 ? (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--text3)",
              }}
            >
              <p style={{ margin: 0 }}>No items in this category</p>
              <Btn
                size="sm"
                variant="ghost"
                onClick={onAddItem}
                style={{ marginTop: "12px" }}
              >
                + Add First Item
              </Btn>
            </div>
          ) : (
            category.items.map((item, index) => (
              <div
                key={item._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px 24px",
                  borderBottom:
                    index === category.items.length - 1
                      ? "none"
                      : "1px solid var(--border)",
                  transition: "all 0.2s",
                  backgroundColor: item.isAvailable
                    ? "transparent"
                    : "rgba(0, 0, 0, 0.02)",
                }}
                className="menu-item"
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: item.isAvailable
                          ? "var(--text1)"
                          : "var(--text3)",
                      }}
                    >
                      {item.name}
                    </span>
                    <Badge
                      color={item.isAvailable ? "success" : "warning"}
                      icon={
                        item.isAvailable ? (
                          <CheckCircle size={10} />
                        ) : (
                          <XCircle size={10} />
                        )
                      }
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                    {item.isPopular && <Badge color="accent">🔥 Popular</Badge>}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text3)",
                        margin: 0,
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                  {item.dietary && item.dietary.length > 0 && (
                    <div
                      style={{ display: "flex", gap: "6px", marginTop: "8px" }}
                    >
                      {item.dietary.includes("veg") && (
                        <Badge color="success" size="sm">
                          🌱 Veg
                        </Badge>
                      )}
                      {item.dietary.includes("nonVeg") && (
                        <Badge color="danger" size="sm">
                          🍗 Non-Veg
                        </Badge>
                      )}
                      {item.dietary.includes("spicy") && (
                        <Badge color="warning" size="sm">
                          🌶️ Spicy
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                  }}
                >
                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "18px",
                        color: "var(--accent)",
                      }}
                    >
                      ₹{item.price}
                    </span>
                    {item.taxPercent > 0 && (
                      <div style={{ fontSize: "11px", color: "var(--text3)" }}>
                        +{item.taxPercent}% tax
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Btn
                      size="sm"
                      variant="ghost"
                      icon={
                        item.isAvailable ? (
                          <EyeOff size={14} />
                        ) : (
                          <Eye size={14} />
                        )
                      }
                      onClick={() => onToggleItemAvailability(item)}
                      title={
                        item.isAvailable
                          ? "Mark as Unavailable"
                          : "Mark as Available"
                      }
                    />
                    <Btn
                      size="sm"
                      variant="ghost"
                      icon={<Edit2 size={14} />}
                      onClick={() => onEditItem(item)}
                      title="Edit Item"
                    />
                    <Btn
                      size="sm"
                      variant="danger"
                      icon={<Trash2 size={14} />}
                      onClick={() => onDeleteItem(item._id)}
                      title="Delete Item"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catModal, setCatModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    type: null,
    id: null,
    name: "",
  });
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    sortOrder: 0,
  });
  const [itemForm, setItemForm] = useState({
    category: "",
    name: "",
    description: "",
    price: "",
    taxPercent: 0,
    isAvailable: true,
    isPopular: false,
    dietary: [],
  });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (catModal || itemModal || deleteConfirm.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [catModal, itemModal, deleteConfirm.show]);

  const load = async () => {
    try {
      const res = await getMenu();
      setMenu(res.data.data || []);
      const exp = {};
      res.data.data?.forEach((c) => (exp[c._id] = true));
      setExpanded(exp);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const handleCat = (e) =>
    setCatForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleItem = (e) =>
    setItemForm((p) => ({
      ...p,
      [e.target.name]:
        e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const saveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editCategory) {
        await updateCategory(editCategory._id, catForm);
        toast.success("Category updated!");
      } else {
        await createCategory(catForm);
        toast.success("Category created!");
      }
      setCatModal(false);
      setEditCategory(null);
      setCatForm({ name: "", description: "", sortOrder: 0 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const saveItem = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await updateMenuItem(editItem._id, itemForm);
        toast.success("Item updated!");
      } else {
        await createMenuItem(itemForm);
        toast.success("Item added!");
      }
      setItemModal(false);
      setEditItem(null);
      setItemForm({
        category: "",
        name: "",
        description: "",
        price: "",
        taxPercent: 0,
        isAvailable: true,
        isPopular: false,
        dietary: [],
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategoryHandler = async () => {
    try {
      await deleteCategory(deleteConfirm.id);
      toast.success("Category deleted!");
      setDeleteConfirm({ show: false, type: null, id: null, name: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  };

  const deleteItemHandler = async () => {
    try {
      await deleteMenuItem(deleteConfirm.id);
      toast.success("Item deleted!");
      setDeleteConfirm({ show: false, type: null, id: null, name: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete item");
    }
  };

  const toggleItemAvailability = async (item) => {
    try {
      await updateMenuItem(item._id, {
        ...item,
        isAvailable: !item.isAvailable,
      });
      toast.success(
        `${item.name} is now ${!item.isAvailable ? "available" : "unavailable"}`,
      );
      load();
    } catch (err) {
      toast.error("Failed to update availability");
    }
  };

  const openEditCategory = (category) => {
    setEditCategory(category);
    setCatForm({
      name: category.name,
      description: category.description || "",
      sortOrder: category.sortOrder || 0,
    });
    setCatModal(true);
  };

  const openEditItem = (item) => {
    setEditItem(item);
    setItemForm({
      category: item.category,
      name: item.name,
      description: item.description || "",
      price: item.price,
      taxPercent: item.taxPercent || 0,
      isAvailable: item.isAvailable,
      isPopular: item.isPopular || false,
      dietary: item.dietary || [],
    });
    setItemModal(true);
  };

  const filteredMenu = menu.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.items?.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  const catOptions = menu.map((c) => ({ value: c._id, label: c.name }));
  const totalItems = menu.reduce((s, c) => s + (c.items?.length || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div
      className="fade-in"
      style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}
    >
      <PageHeader
        title="Menu Management"
        subtitle={`${menu.length} categories · ${totalItems} items`}
        action={
          <div style={{ display: "flex", gap: "12px" }}>
            <Field
              type="search"
              placeholder="Search menu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "250px" }}
            />
            <Btn
              onClick={() => {
                setEditCategory(null);
                setCatForm({ name: "", description: "", sortOrder: 0 });
                setCatModal(true);
              }}
              variant="secondary"
              icon={<Plus size={16} />}
            >
              Add Category
            </Btn>
            <Btn
              onClick={() => {
                setEditItem(null);
                setItemForm({
                  category: "",
                  name: "",
                  description: "",
                  price: "",
                  taxPercent: 0,
                  isAvailable: true,
                  isPopular: false,
                  dietary: [],
                });
                setItemModal(true);
              }}
              variant="primary"
              icon={<Plus size={16} />}
            >
              Add Item
            </Btn>
          </div>
        }
      />

      {filteredMenu.length === 0 ? (
        <Empty
          icon="🍽️"
          title={searchTerm ? "No matching items" : "No menu yet"}
          desc={
            searchTerm
              ? "Try a different search term"
              : "Start by creating a category, then add items."
          }
          action={
            !searchTerm && (
              <Btn
                onClick={() => {
                  setEditCategory(null);
                  setCatForm({ name: "", description: "", sortOrder: 0 });
                  setCatModal(true);
                }}
              >
                Create Category
              </Btn>
            )
          }
        />
      ) : (
        filteredMenu.map((cat) => (
          <CategoryCard
            key={cat._id}
            category={cat}
            isExpanded={expanded[cat._id]}
            onToggleExpand={() =>
              setExpanded((prev) => ({ ...prev, [cat._id]: !prev[cat._id] }))
            }
            onAddItem={() => {
              setItemForm((prev) => ({ ...prev, category: cat._id }));
              setEditItem(null);
              setItemModal(true);
            }}
            onEditCategory={() => openEditCategory(cat)}
            onDeleteCategory={() =>
              setDeleteConfirm({
                show: true,
                type: "category",
                id: cat._id,
                name: cat.name,
              })
            }
            onEditItem={openEditItem}
            onDeleteItem={(id) =>
              setDeleteConfirm({
                show: true,
                type: "item",
                id: id,
                name: "this item",
              })
            }
            onToggleItemAvailability={toggleItemAvailability}
          />
        ))
      )}

      {/* Category Modal */}
      <CustomModal
        open={catModal}
        onClose={() => {
          setCatModal(false);
          setEditCategory(null);
        }}
        title={editCategory ? "Edit Category" : "Add New Category"}
      >
        <form
          onSubmit={saveCategory}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <Field
            label="Category Name *"
            name="name"
            value={catForm.name}
            onChange={handleCat}
            placeholder="e.g., Starters, Main Course, Desserts"
            required
          />
          <Field
            label="Description"
            name="description"
            value={catForm.description}
            onChange={handleCat}
            placeholder="Brief description of the category"
            as="textarea"
            rows="3"
          />
          <Field
            label="Sort Order"
            name="sortOrder"
            type="number"
            value={catForm.sortOrder}
            onChange={handleCat}
            placeholder="0"
            helpText="Lower numbers appear first"
          />
          <FormActions>
            <Btn
              variant="ghost"
              onClick={() => setCatModal(false)}
              type="button"
            >
              Cancel
            </Btn>
            <Btn type="submit" loading={saving}>
              {editCategory ? "Update Category" : "Create Category"}
            </Btn>
          </FormActions>
        </form>
      </CustomModal>

      {/* Item Modal */}
      <CustomModal
        open={itemModal}
        onClose={() => {
          setItemModal(false);
          setEditItem(null);
        }}
        title={editItem ? "Edit Menu Item" : "Add New Menu Item"}
        size="lg"
      >
        <form
          onSubmit={saveItem}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          <Select
            label="Category *"
            name="category"
            value={itemForm.category}
            onChange={handleItem}
            options={catOptions}
            required
          />
          <Field
            label="Item Name *"
            name="name"
            value={itemForm.name}
            onChange={handleItem}
            placeholder="e.g., Butter Chicken, Paneer Tikka"
            required
          />
          <Field
            label="Description"
            name="description"
            value={itemForm.description}
            onChange={handleItem}
            placeholder="Describe the item"
            as="textarea"
            rows="2"
          />
          <FormGrid columns={2}>
            <Field
              label="Price (₹) *"
              name="price"
              type="number"
              value={itemForm.price}
              onChange={handleItem}
              placeholder="250"
              required
            />
            <Field
              label="Tax (%)"
              name="taxPercent"
              type="number"
              value={itemForm.taxPercent}
              onChange={handleItem}
              placeholder="5"
            />
          </FormGrid>
          <FormGrid columns={2}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="isAvailable"
                checked={itemForm.isAvailable}
                onChange={handleItem}
                style={{ width: "auto" }}
              />
              <span>Available for ordering</span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                name="isPopular"
                checked={itemForm.isPopular}
                onChange={handleItem}
                style={{ width: "auto" }}
              />
              <span>Mark as Popular 🔥</span>
            </label>
          </FormGrid>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "8px",
                display: "block",
              }}
            >
              Dietary Information
            </label>
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={itemForm.dietary.includes("veg")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: [...prev.dietary, "veg"],
                      }));
                    } else {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: prev.dietary.filter((d) => d !== "veg"),
                      }));
                    }
                  }}
                />
                🌱 Vegetarian
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={itemForm.dietary.includes("nonVeg")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: [...prev.dietary, "nonVeg"],
                      }));
                    } else {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: prev.dietary.filter((d) => d !== "nonVeg"),
                      }));
                    }
                  }}
                />
                🍗 Non-Vegetarian
              </label>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={itemForm.dietary.includes("spicy")}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: [...prev.dietary, "spicy"],
                      }));
                    } else {
                      setItemForm((prev) => ({
                        ...prev,
                        dietary: prev.dietary.filter((d) => d !== "spicy"),
                      }));
                    }
                  }}
                />
                🌶️ Spicy
              </label>
            </div>
          </div>
          <FormActions>
            <Btn
              variant="ghost"
              onClick={() => setItemModal(false)}
              type="button"
            >
              Cancel
            </Btn>
            <Btn type="submit" loading={saving}>
              {editItem ? "Update Item" : "Add Item"}
            </Btn>
          </FormActions>
        </form>
      </CustomModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirm.show}
        onClose={() =>
          setDeleteConfirm({ show: false, type: null, id: null, name: "" })
        }
        onConfirm={
          deleteConfirm.type === "category"
            ? deleteCategoryHandler
            : deleteItemHandler
        }
        title={`Delete ${deleteConfirm.type === "category" ? "Category" : "Item"}`}
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.${deleteConfirm.type === "category" ? " All items in this category will also be deleted." : ""}`}
      />
    </div>
  );
}
