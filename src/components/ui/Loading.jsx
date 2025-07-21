import Card from "@/components/atoms/Card";

const Loading = ({ type = "table" }) => {
  if (type === "dashboard") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                  </div>
                  <div className="w-12 h-12 bg-secondary-200 rounded-lg"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-secondary-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                    <div className="h-6 bg-secondary-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
            <div className="h-10 bg-secondary-200 rounded w-80"></div>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-4 bg-secondary-200 rounded"></div>
              ))}
            </div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-7 gap-4">
                {[...Array(7)].map((_, j) => (
                  <div key={j} className="h-4 bg-secondary-200 rounded"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-secondary-200 rounded w-1/3"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-secondary-200 rounded"></div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default Loading;