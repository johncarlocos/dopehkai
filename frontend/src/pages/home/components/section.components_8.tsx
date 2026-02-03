import AppAssets from "../../../ultis/assets";

export function SectionComponent8() {
    return (
        <section className="flex items-center justify-center sm:mt-0 p-3 flex-col bg-black">
            <a href="/" className="flex items-center">
                <img src={AppAssets.logo} className="h-20" alt="Logo" />
            </a>
            <p className="text-gray-300 mt-1 text-base font-body">{"Copyright @2025 DOPE"}</p>
        </section>
    );
}
