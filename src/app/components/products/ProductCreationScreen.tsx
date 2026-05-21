import CreateProductModal from "./CreateProductModal";
import { Project } from "../../types";

interface ProductCreationScreenProps {
  onBack: () => void;
  onCreate: (products: any[]) => void;
  onCreateSKU: () => void;
  onCreateClaim: () => void;
  sourceProject?: Project;
}

export default function ProductCreationScreen({
  onBack,
  onCreate,
  onCreateSKU,
  sourceProject,
}: ProductCreationScreenProps) {
  return (
    <CreateProductModal
      isOpen={true}
      onClose={onBack}
      onCreate={onCreate}
      project={sourceProject}
      onNavigateToSKU={onCreateSKU}
    />
  );
}
