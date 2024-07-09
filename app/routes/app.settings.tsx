import React from "react";

const Settings = () => {
  const handleClick = async () => {
    const selected = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      filter: {
        variants: false,
        archived: false,
        draft: false,
      },
    });
    console.log(selected);
  };
  return (
    <div>
      <button onClick={handleClick}>Add prodyct</button>
    </div>
  );
};

export default Settings;
